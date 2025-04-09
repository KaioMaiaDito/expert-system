import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFacts() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFacts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/facts');
      setFacts(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  const createFact = async fact => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/facts',
        fact
      );
      setFacts([...facts, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteFact = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/facts/${id}`);
      setFacts(facts.filter(fact => fact.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return { facts, loading, error, createFact, deleteFact };
}
