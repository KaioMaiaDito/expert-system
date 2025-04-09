import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FactList = () => {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFact, setSelectedFact] = useState(null);
  // Instead of storing the full fact object for deletion, we now store only its id.
  const [factToDeleteId, setFactToDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showNewFactModal, setShowNewFactModal] = useState(false);
  const [newFactData, setNewFactData] = useState({
    name: '',
    type: 'string',
    possibleValues: '',
  });

  // Fetch facts from API
  const fetchFacts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/facts');
      setFacts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar fatos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  // Handle fact click to view details; the fact object contains its id
  const handleFactClick = fact => {
    setSelectedFact(fact);
    setShowDetailModal(true);
  };

  // When clicking to delete, extract the id immediately and store it in state.
  const handleDeleteClick = fact => {
    console.log(fact);

    if (!fact.id) {
      console.error("O fato não possui uma propriedade 'id':", fact);
      alert('Erro: O fato não possui um id válido.');
      return;
    }
    setFactToDeleteId(fact.id);
    setShowDeleteModal(true);
  };

  // Confirm fact deletion using the extracted factToDeleteId
  const confirmDelete = async () => {
    if (!factToDeleteId) return;
    try {
      await axios.delete(`http://localhost:3000/api/facts/${factToDeleteId}`);
      setShowDeleteModal(false);
      setFactToDeleteId(null);
      fetchFacts();
    } catch (error) {
      console.error('Erro ao excluir fato:', error);
      alert(
        'Não foi possível excluir o fato. Verifique se o endpoint está correto e se o fato existe.'
      );
    }
  };

  // Add new fact modal open handler
  const handleAddNewFact = () => {
    setNewFactData({ name: '', type: 'string', possibleValues: '' });
    setShowNewFactModal(true);
  };

  // Submit new fact to server
  const handleCreateFact = async () => {
    if (!newFactData.name.trim() || !newFactData.type.trim()) {
      alert("Os campos 'Nome' e 'Tipo' são obrigatórios.");
      return;
    }
    let payload;
    if (newFactData.type === 'boolean') {
      payload = {
        name: newFactData.name,
        type: newFactData.type,
        possibleValues: ['sim', 'não'],
      };
    } else {
      // type is string
      if (!newFactData.possibleValues.trim()) {
        alert('Você precisa informar os valores possíveis para o tipo string.');
        return;
      }
      payload = {
        name: newFactData.name,
        type: newFactData.type,
        possibleValues: newFactData.possibleValues
          .split(',')
          .map(v => v.trim()),
      };
    }
    try {
      await axios.post('http://localhost:3000/api/facts', payload);
      setShowNewFactModal(false);
      fetchFacts();
    } catch (error) {
      console.error('Erro ao criar fato:', error);
      alert('Erro ao criar fato. Verifique o console para mais detalhes.');
    }
  };

  if (loading) return <div>Carregando fatos...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Fatos</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleAddNewFact} style={{ marginRight: '1rem' }}>
          Adicionar Novo Fato
        </button>
      </div>
      {facts.length === 0 ? (
        <p>Nenhum fato encontrado.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {facts.map(fact => (
            <li
              key={fact.id}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                marginBottom: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => handleFactClick(fact)}
            >
              <span>
                {fact.name} (Tipo: {fact.type})
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(fact);
                }}
                style={{
                  backgroundColor: 'red',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedFact && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>{selectedFact.name}</h2>
            <p>
              <strong>Tipo:</strong> {selectedFact.type}
            </p>
            <p>
              <strong>Valores Possíveis:</strong>{' '}
              {selectedFact.possibleValues.join(', ')}
            </p>
            <button onClick={() => setShowDetailModal(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && factToDeleteId && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <h2>Confirmar Exclusão de Fato</h2>
            <p>Tem certeza que deseja excluir o fato?</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={confirmDelete}
                style={{
                  marginRight: '1rem',
                  backgroundColor: 'red',
                  color: '#fff',
                }}
              >
                Confirmar
              </button>
              <button onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Fact Modal */}
      {showNewFactModal && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowNewFactModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Novo Fato</h2>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Nome do Fato"
                value={newFactData.name}
                onChange={e =>
                  setNewFactData({ ...newFactData, name: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                }}
              />
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Tipo:
              </label>
              <select
                value={newFactData.type}
                onChange={e =>
                  setNewFactData({
                    ...newFactData,
                    type: e.target.value,
                    possibleValues: '',
                  })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
              </select>
              {newFactData.type === 'string' && (
                <input
                  type="text"
                  placeholder="Valores Possíveis (separados por vírgula)"
                  value={newFactData.possibleValues}
                  onChange={e =>
                    setNewFactData({
                      ...newFactData,
                      possibleValues: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                  }}
                />
              )}
              {newFactData.type === 'boolean' && (
                <p>Valores padrões: "sim", "não"</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCreateFact}
                style={{ marginRight: '1rem' }}
              >
                Criar
              </button>
              <button onClick={() => setShowNewFactModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactList;
