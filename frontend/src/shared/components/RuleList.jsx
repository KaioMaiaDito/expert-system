import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddRule from './RuleBuilder';

const RuleList = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  // Fetch rules from API
  const fetchRules = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rules');
      setRules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Handle rule click to view details
  const handleRuleClick = rule => {
    setSelectedRule(rule);
    setShowDetailModal(true);
  };

  // Handle delete confirmation modal open
  const handleDeleteClick = rule => {
    setRuleToDelete(rule);
    setShowDeleteModal(true);
  };

  // Confirm rule deletion
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/rules/${ruleToDelete.id}`);
      setShowDeleteModal(false);
      setRuleToDelete(null);
      fetchRules();
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
    }
  };

  // Add new rule modal open handler
  const handleAddNewRule = () => {
    setShowNewRuleModal(true);
  };

  // Callback to be executed after a new rule is created.
  const onRuleCreated = () => {
    setShowNewRuleModal(false);
    fetchRules();
  };

  if (loading) return <div>Carregando regras...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Regras</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleAddNewRule} style={{ marginRight: '1rem' }}>
          Adicionar Nova Regra
        </button>
      </div>
      {rules.length === 0 ? (
        <p>Nenhuma regra encontrada.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rules.map(rule => (
            <li
              key={rule.id}
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
              onClick={() => handleRuleClick(rule)}
            >
              <span>
                <strong>ID: </strong>
                {rule.id} - <strong>Conclusão: </strong>
                {rule.conclusion}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(rule);
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
      {showDetailModal && selectedRule && (
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
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Regra: {selectedRule.id}</h2>
            <p>
              <strong>Condições:</strong>
            </p>
            <pre
              style={{
                background: '#f4f4f4',
                padding: '1rem',
                borderRadius: '4px',
              }}
            >
              {selectedRule.condition
                ? JSON.stringify(selectedRule.condition, null, 2)
                : JSON.stringify(selectedRule.conditions, null, 2)}
            </pre>
            <p>
              <strong>Conclusão:</strong> {selectedRule.conclusion}
            </p>
            <button onClick={() => setShowDetailModal(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ruleToDelete && (
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
            <h2>Confirmar Exclusão de Regra</h2>
            <p>Tem certeza que deseja excluir a regra "{ruleToDelete.id}"?</p>
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

      {/* New Rule Modal integrating AddRule Component */}
      {showNewRuleModal && (
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
          onClick={() => setShowNewRuleModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Adicionar Nova Regra</h2>
            <AddRule onRuleCreated={onRuleCreated} />
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button onClick={() => setShowNewRuleModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleList;
