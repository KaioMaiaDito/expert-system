import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RuleBuilder = ({ onRuleCreated }) => {
  const [facts, setFacts] = useState([]);
  const [conditions, setConditions] = useState([{ factId: '', value: '' }]);
  const [connectors, setConnectors] = useState([]);
  const [conclusion, setConclusion] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/facts')
      .then(response => setFacts(response.data))
      .catch(error => console.error('Erro ao carregar fatos:', error));
  }, []);

  const addCondition = () => {
    setConnectors([...connectors, 'E']);
    setConditions([...conditions, { factId: '', value: '' }]);
  };

  const removeCondition = index => {
    if (conditions.length === 1) {
      alert('Você deve ter pelo menos uma condição.');
      return;
    }
    const updatedConditions = conditions.filter((_, idx) => idx !== index);
    let updatedConnectors = [...connectors];
    if (index === 0) {
      updatedConnectors = updatedConnectors.slice(1);
    } else {
      updatedConnectors.splice(index - 1, 1);
    }
    setConditions(updatedConditions);
    setConnectors(updatedConnectors);
  };

  const updateConditionFact = (index, factId) => {
    const updatedConditions = conditions.map((cond, idx) => {
      if (idx === index) return { ...cond, factId, value: '' };
      return cond;
    });
    setConditions(updatedConditions);
  };

  const updateConditionValue = (index, value) => {
    const updatedConditions = conditions.map((cond, idx) => {
      if (idx === index) return { ...cond, value };
      return cond;
    });
    setConditions(updatedConditions);
  };

  const updateMultiConditionValue = (index, values) => {
    const updatedConditions = conditions.map((cond, idx) => {
      if (idx === index) return { ...cond, value: values };
      return cond;
    });
    setConditions(updatedConditions);
  };

  const updateConnector = (index, value) => {
    const updatedConnectors = connectors.map((conn, idx) => {
      if (idx === index) return value;
      return conn;
    });
    setConnectors(updatedConnectors);
  };

  // Exemplo de transformação para uma condição de igualdade
  function transformCondition(cond) {
    // Se o valor for um array (caso do fato string), usamos equals com valor array;
    // caso contrário, permanece como string.
    return {
      equals: { fact: getFactNameById(cond.factId), value: cond.value },
    };
  }

  const transformConditions = () => {
    const allConditions = [];
    const transformCondition = cond => {
      const factObj = facts.find(f => f.id === cond.factId);
      const factName = factObj ? factObj.name : cond.factId;
      return { equals: { fact: factName, value: cond.value } };
    };

    let currentGroup = [transformCondition(conditions[0])];

    for (let i = 1; i < conditions.length; i++) {
      const connector = connectors[i - 1];
      const transformed = transformCondition(conditions[i]);
      if (connector === 'OU') {
        currentGroup.push(transformed);
      } else if (connector === 'E') {
        if (currentGroup.length > 1) {
          allConditions.push({ or: currentGroup });
        } else {
          allConditions.push(currentGroup[0]);
        }
        currentGroup = [transformed];
      } else if (connector === 'NÃO') {
        const factObj = facts.find(f => f.id === conditions[i].factId);
        if (factObj && factObj.type !== 'string') {
          alert('O conector NÃO só pode ser aplicado a fatos do tipo string.');
          return;
        }
        if (currentGroup.length > 0) {
          if (currentGroup.length > 1) {
            allConditions.push({ or: currentGroup });
          } else {
            allConditions.push(currentGroup[0]);
          }
        }
        const currentTransformed = transformCondition(conditions[i]); // { equals: { fact: factName, value: cond.value } }
        const negated = { not: { includes: currentTransformed.equals } };
        allConditions.push(negated);
        currentGroup = [];
      }
    }
    if (currentGroup.length > 0) {
      if (currentGroup.length > 1) {
        allConditions.push({ or: currentGroup });
      } else {
        allConditions.push(currentGroup[0]);
      }
    }
    return allConditions;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!conclusion.trim()) {
      alert('Por favor, insira a conclusão (ENTÃO).');
      return;
    }

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
        const selectedFact = facts.find(f => f.id === cond.factId);
        const hasPredefinedValues =
          selectedFact &&
          Array.isArray(selectedFact.possibleValues) &&
          selectedFact.possibleValues.length > 0;

        // Se o conector anterior for "NÃO", filtrar para apenas fatos do tipo string.
        const availableFacts =
          index > 0 && connectors[index - 1] === 'NÃO'
            ? facts.filter(f => f.type === 'string')
            : facts;

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
                  <option value="NÃO">NÃO</option>
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
              {availableFacts.map(fact => (
                <option key={fact.id} value={fact.id}>
                  {fact.name} ({fact.type})
                </option>
              ))}
            </select>
            {selectedFact && hasPredefinedValues ? (
              selectedFact.type === 'string' ? (
                <select
                  multiple
                  value={cond.value || []}
                  onChange={e =>
                    updateMultiConditionValue(
                      index,
                      Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      )
                    )
                  }
                  style={{ padding: '0.5rem', flex: 1, marginRight: '0.5rem' }}
                  required
                >
                  {selectedFact.possibleValues
                    .filter(val => typeof val === 'string')
                    .map((val, idx) => (
                      <option key={idx} value={val}>
                        {val}
                      </option>
                    ))}
                </select>
              ) : (
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
              )
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
