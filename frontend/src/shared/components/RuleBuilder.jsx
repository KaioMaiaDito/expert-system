import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RuleBuilder = ({ onRuleCreated }) => {
  const [facts, setFacts] = useState([]);
  // "conditions" stores each condition with the selected fact and its chosen value
  const [conditions, setConditions] = useState([{ factId: '', value: '' }]);
  // "connectors" stores the connector ("E" or "OU") between conditions.
  // It has one less element than conditions.
  const [connectors, setConnectors] = useState([]);
  // "conclusion" is the text for the "ENTÃO" part.
  const [conclusion, setConclusion] = useState('');

  // Fetch available facts for user selection.
  useEffect(() => {
    axios
      .get('http://localhost:3000/api/facts')
      .then(response => setFacts(response.data))
      .catch(error => console.error('Erro ao carregar fatos:', error));
  }, []);

  // Adds a new empty condition.
  const addCondition = () => {
    // For UI purposes, add connector as "E" by default.
    setConnectors([...connectors, 'E']);
    setConditions([...conditions, { factId: '', value: '' }]);
  };

  // Removes a condition from the list.
  const removeCondition = index => {
    // Always keep at least one condition.
    if (conditions.length === 1) {
      alert('Você deve ter pelo menos uma condição.');
      return;
    }
    const updatedConditions = conditions.filter((_, idx) => idx !== index);
    let updatedConnectors = [...connectors];

    // Adjust connectors array based on the removed condition.
    if (index === 0) {
      // Remove connector at index 0 since the first condition was removed.
      updatedConnectors = updatedConnectors.slice(1);
    } else {
      // Remove the connector that linked previous condition to this one.
      updatedConnectors.splice(index - 1, 1);
    }
    setConditions(updatedConditions);
    setConnectors(updatedConnectors);
  };

  // Update the selected fact for a specific condition.
  const updateConditionFact = (index, factId) => {
    const updatedConditions = conditions.map((cond, idx) => {
      if (idx === index) {
        return { ...cond, factId, value: '' };
      }
      return cond;
    });
    setConditions(updatedConditions);
  };

  // Update the value for a specific condition.
  const updateConditionValue = (index, value) => {
    const updatedConditions = conditions.map((cond, idx) => {
      if (idx === index) {
        return { ...cond, value };
      }
      return cond;
    });
    setConditions(updatedConditions);
  };

  // Update the connector for a given condition (connector between condition i and i+1).
  const updateConnector = (index, value) => {
    const updatedConnectors = connectors.map((conn, idx) => {
      if (idx === index) return value;
      return conn;
    });
    setConnectors(updatedConnectors);
  };

  // Transform the conditions and connectors into the nested structure the backend expects.
  // This algorithm groups consecutive conditions connected with "OU" together.
  const transformConditions = () => {
    const allConditions = [];
    // Transform a single condition into equals format.
    const transformCondition = cond => {
      const factObj = facts.find(f => f.id === cond.factId);
      const factName = factObj ? factObj.name : cond.factId;
      return { equals: { fact: factName, value: cond.value } };
    };

    // Start with the first condition.
    let currentGroup = [transformCondition(conditions[0])];

    // Iterate over the subsequent conditions.
    for (let i = 1; i < conditions.length; i++) {
      const connector = connectors[i - 1]; // connector between (i-1) and i.
      const transformed = transformCondition(conditions[i]);
      if (connector === 'OU') {
        // If connector is OU, add to the current group.
        currentGroup.push(transformed);
      } else if (connector === 'E') {
        // Connector is E, finish the current group.
        if (currentGroup.length > 1) {
          allConditions.push({ or: currentGroup });
        } else {
          allConditions.push(currentGroup[0]);
        }
        // Start a new group with the current condition.
        currentGroup = [transformed];
      }
    }
    // Push the final group.
    if (currentGroup.length > 1) {
      allConditions.push({ or: currentGroup });
    } else {
      allConditions.push(currentGroup[0]);
    }
    return allConditions;
  };

  // Submits the rule payload to the backend.
  const handleSubmit = async e => {
    e.preventDefault();

    if (!conclusion.trim()) {
      alert('Por favor, insira a conclusão (ENTÃO).');
      return;
    }

    // Validate every condition.
    for (let cond of conditions) {
      if (!cond.factId) {
        alert('Selecione um fato para cada condição.');
        return;
      }
      const factObj = facts.find(f => f.id === cond.factId);
      if (
        factObj &&
        Array.isArray(factObj.possibleValues) &&
        factObj.possibleValues.length > 0 &&
        !cond.value
      ) {
        alert(`Selecione um valor para o fato "${factObj.name}".`);
        return;
      }
    }

    const payload = {
      conclusion,
      condition: {
        all: transformConditions(),
      },
    };

    try {
      await axios.post('http://localhost:3000/api/rules', payload);
      alert('Regra criada com sucesso.');
      setConclusion('');
      setConditions([{ factId: '', value: '' }]);
      setConnectors([]);
      if (onRuleCreated) onRuleCreated();
    } catch (error) {
      console.error('Erro ao criar regra:', error);
      alert('Erro ao criar regra.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <h3>Construir Regra</h3>
      {conditions.map((cond, index) => {
        // Get the selected fact details for proper input.
        const selectedFact = facts.find(f => f.id === cond.factId);
        const hasPredefinedValues =
          selectedFact &&
          Array.isArray(selectedFact.possibleValues) &&
          selectedFact.possibleValues.length > 0;
        return (
          <div
            key={index}
            style={{
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {index === 0 ? (
              <span style={{ marginRight: '0.5rem' }}>SE</span>
            ) : (
              <>
                <select
                  value={connectors[index - 1]}
                  onChange={e => updateConnector(index - 1, e.target.value)}
                  style={{ marginRight: '0.5rem', padding: '0.5rem' }}
                >
                  <option value="E">E</option>
                  <option value="OU">OU</option>
                </select>
                <span style={{ marginRight: '0.5rem' }}>SE</span>
              </>
            )}
            <select
              value={cond.factId}
              onChange={e => updateConditionFact(index, e.target.value)}
              style={{
                padding: '0.5rem',
                flex: 1,
                marginRight: '0.5rem',
              }}
              required
            >
              <option value="">Selecione um fato</option>
              {facts.map(fact => (
                <option key={fact.id} value={fact.id}>
                  {fact.name} ({fact.type})
                </option>
              ))}
            </select>
            {selectedFact && hasPredefinedValues ? (
              <select
                value={cond.value}
                onChange={e => updateConditionValue(index, e.target.value)}
                style={{ padding: '0.5rem', flex: 1, marginRight: '0.5rem' }}
                required
              >
                <option value="">Selecione um valor</option>
                {selectedFact.possibleValues.map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={cond.value}
                onChange={e => updateConditionValue(index, e.target.value)}
                placeholder="Valor"
                style={{ padding: '0.5rem', flex: 1, marginRight: '0.5rem' }}
              />
            )}
            <button
              type="button"
              onClick={() => removeCondition(index)}
              style={{
                padding: '0.5rem',
                background: '#ccc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Excluir
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addCondition}
        style={{ marginBottom: '1rem' }}
      >
        Adicionar Condição
      </button>
      <div
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}
      >
        <span style={{ marginRight: '0.5rem' }}>ENTÃO</span>
        <input
          type="text"
          value={conclusion}
          onChange={e => setConclusion(e.target.value)}
          placeholder="Descrição da conclusão"
          style={{ padding: '0.5rem', flex: 1 }}
          required
        />
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Criar Regra
      </button>
    </form>
  );
};

export default RuleBuilder;
