import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionFlow = () => {
  const [question, setQuestion] = useState('');
  const [factValues, setFactValues] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inicia a sessão do DFA chamando a rota /dfa/start
  useEffect(() => {
    axios
      .post('http://localhost:3000/api/dfa/start')
      .then(response => {
        setQuestion(response.data.nextQuestion);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao iniciar a sessão do DFA:', error);
        setLoading(false);
      });
  }, []);

  // Função para enviar uma resposta do usuário e obter a próxima pergunta
  const handleAnswer = (fact, value) => {
    axios
      .post('http://localhost:3000/api/dfa/answer', { fact, value })
      .then(response => {
        if (response.data.finished) {
          setFinished(true);
          setFactValues(response.data.factValues);
        } else {
          setQuestion(response.data.nextQuestion);
        }
      })
      .catch(error => {
        console.error('Erro ao enviar a resposta:', error);
      });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {finished ? (
        <div>
          <h2>Fluxo Concluído!</h2>
          <pre>{JSON.stringify(factValues, null, 2)}</pre>
        </div>
      ) : (
        <div>
          <h2>{question}</h2>
          {/* Exemplo de botões para respostas.
              Você pode adaptar os botões conforme os fatos que deseja coletar.
              No exemplo, assumimos que a primeira pergunta é referente ao fato "corre". */}
          <button onClick={() => handleAnswer('corre', 'sim')}>Sim</button>
          <button onClick={() => handleAnswer('corre', 'nao')}>Não</button>
        </div>
      )}
    </div>
  );
};

export default QuestionFlow;
