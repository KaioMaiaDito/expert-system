import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionFlow = ({ projectId }) => {
  const [question, setQuestion] = useState('');
  const [possibleValues, setPossibleValues] = useState([]);
  const [factValues, setFactValues] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]); // para fatos string

  // Inicia a sessão do DFA chamando a rota /dfa/start
  useEffect(() => {
    axios
      .post('http://localhost:3000/api/dfa/start', { projectId })
      .then(response => {
        if (response.data.finished) {
          setFinished(true);
          setFactValues(response.data.factValues);
          setConclusion(response.data.message);
        } else {
          setQuestion(response.data.nextQuestion);
          if (response.data.possibleValues) {
            setPossibleValues(response.data.possibleValues);
          } else {
            setPossibleValues(['sim', 'nao']);
          }
          setSelectedAnswers([]); // reinicia respostas selecionadas
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao iniciar a sessão do DFA:', error);
        setLoading(false);
      });
  }, [projectId]);

  // Função para enviar a resposta e obter a próxima pergunta
  const handleAnswer = (fact, value) => {
    axios
      .post('http://localhost:3000/api/dfa/answer', { fact, value })
      .then(response => {
        if (response.data.finished) {
          setFinished(true);
          setFactValues(response.data.factValues);
          setConclusion(response.data.message);
        } else {
          setQuestion(response.data.nextQuestion);
          if (response.data.possibleValues) {
            setPossibleValues(response.data.possibleValues);
          } else {
            setPossibleValues(['sim', 'nao']);
          }
          setSelectedAnswers([]); // reseta após enviar resposta
        }
      })
      .catch(error => {
        console.error('Erro ao enviar a resposta:', error);
      });
  };

  // Função auxiliar para alternar seleção no select múltiplo
  const handleSelectChange = e => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedAnswers(values);
  };

  // Função auxiliar para extrair o nome do fato a partir da pergunta.
  // Exemplo: "Qual o valor para "corre"?" retornará "corre"
  const getFactFromQuestion = questionText => {
    const regex = /"([^"]+)"/;
    const match = regex.exec(questionText);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  };

  if (loading) return <div>Carregando...</div>;

  // Verifica se o fato é booleano (possíveis valores "sim" e "nao")
  const isBooleanFact =
    possibleValues.length === 2 &&
    possibleValues.includes('sim') &&
    (possibleValues.includes('não') || possibleValues.includes('nao'));

  return (
    <div>
      {finished ? (
        <div>
          <h2>Fluxo Concluído!</h2>
          {conclusion && <p>Conclusão: {conclusion}</p>}
          <pre>{JSON.stringify(factValues, null, 2)}</pre>
        </div>
      ) : (
        <div>
          <h2>{question}</h2>
          {isBooleanFact ? (
            <div>
              <button
                onClick={() =>
                  handleAnswer(getFactFromQuestion(question), 'sim')
                }
                style={{
                  padding: '0.5rem 1rem',
                  marginRight: '0.5rem',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sim
              </button>
              <button
                onClick={() =>
                  handleAnswer(getFactFromQuestion(question), 'nao')
                }
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'red',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Não
              </button>
            </div>
          ) : (
            <div>
              <select
                multiple
                value={selectedAnswers}
                onChange={handleSelectChange}
                style={{
                  padding: '0.5rem',
                  width: '100%',
                  marginBottom: '1rem',
                }}
              >
                {possibleValues.map(val => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  handleAnswer(
                    getFactFromQuestion(question),
                    // Envia um array com os valores selecionados
                    selectedAnswers
                  )
                }
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Enviar respostas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionFlow;
