import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionFlow = projectId => {
  const [question, setQuestion] = useState('');
  const [possibleValues, setPossibleValues] = useState([]);
  const [factValues, setFactValues] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState('');

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
          // Se o backend enviar os possibleValues, usa-os; caso contrário, usa valores padrão
          if (response.data.possibleValues) {
            setPossibleValues(response.data.possibleValues);
          } else {
            setPossibleValues(['sim', 'nao']);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao iniciar a sessão do DFA:', error);
        setLoading(false);
      });
  }, [projectId]);

  // Função para enviar uma resposta do usuário e obter a próxima pergunta
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
        }
      })
      .catch(error => {
        console.error('Erro ao enviar a resposta:', error);
      });
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
          <div>
            {possibleValues.map(value => (
              <button
                key={value}
                onClick={() =>
                  handleAnswer(getFactFromQuestion(question), value)
                }
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFlow;
