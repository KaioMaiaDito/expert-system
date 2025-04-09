import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectBuilder = ({ onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]); // Armazena as regras associadas como objetos completos
  const [selectedRule, setSelectedRule] = useState(''); // Regra atualmente selecionada no select

  // Fetch the available rules to associate with the project.
  useEffect(() => {
    axios
      .get('http://localhost:3000/api/rules')
      .then(response => setAvailableRules(response.data))
      .catch(error =>
        console.error('Erro ao carregar regras para associação:', error)
      );
  }, []);

  const handleAddRule = () => {
    if (!selectedRule) {
      alert('Por favor, selecione uma regra para adicionar.');
      return;
    }

    // Encontra a regra selecionada
    const ruleToAdd = availableRules.find(rule => rule.id === selectedRule);

    if (!ruleToAdd) {
      alert('Regra selecionada não encontrada.');
      return;
    }

    // Adiciona a regra selecionada à lista de regras associadas
    setSelectedRules([...selectedRules, ruleToAdd]);

    // Remove a regra selecionada da lista de regras disponíveis
    setAvailableRules(availableRules.filter(rule => rule.id !== selectedRule));

    // Limpa a seleção atual
    setSelectedRule('');
  };

  const handleRemoveRule = ruleId => {
    // Encontra a regra a ser removida
    const ruleToRemove = selectedRules.find(rule => rule.id === ruleId);

    if (!ruleToRemove) {
      alert('Regra a ser removida não encontrada.');
      return;
    }

    // Remove a regra da lista de regras associadas
    setSelectedRules(selectedRules.filter(rule => rule.id !== ruleId));

    // Adiciona a regra de volta à lista de regras disponíveis
    setAvailableRules([...availableRules, ruleToRemove]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para o projeto.');
      return;
    }

    const payload = {
      name,
      description,
      rules: selectedRules.map(rule => rule.id), // Envia apenas os IDs das regras associadas
    };

    try {
      await axios.post('http://localhost:3000/api/projects', payload);
      alert('Projeto criado com sucesso.');
      setName('');
      setDescription('');
      setSelectedRules([]);
      setAvailableRules([]);
      if (onProjectCreated) onProjectCreated();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <h3>Criar Projeto</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Nome:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: '0.5rem', marginLeft: '0.5rem', width: '100%' }}
            required
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Descrição:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              padding: '0.5rem',
              marginLeft: '0.5rem',
              width: '100%',
              height: '80px',
            }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Regras disponíveis:
          <select
            value={selectedRule}
            onChange={e => setSelectedRule(e.target.value)}
            style={{
              padding: '0.5rem',
              marginLeft: '0.5rem',
              width: '100%',
            }}
          >
            <option value="">Selecione uma regra</option>
            {availableRules.map(rule => (
              <option key={rule.id} value={rule.id}>
                {rule.conclusion} (ID: {rule.id})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleAddRule}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '0.5rem',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Adicionar Regra
        </button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h4>Regras associadas:</h4>
        {selectedRules.length > 0 ? (
          <ul>
            {selectedRules.map(rule => (
              <li key={rule.id} style={{ marginBottom: '0.5rem' }}>
                {rule.conclusion} (ID: {rule.id})
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  style={{
                    marginLeft: '1rem',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: 'red',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma regra associada.</p>
        )}
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Criar Projeto
      </button>
    </form>
  );
};

export default ProjectBuilder;
