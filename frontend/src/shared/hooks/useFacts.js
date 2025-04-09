import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export function useFacts() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/facts`)
      .then(response => {
        setFacts(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const createFact = async newFact => {
    try {
      const response = await axios.post(`${BASE_URL}/facts`, newFact);
      setFacts([...facts, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteFact = async factId => {
    try {
      await axios.delete(`${BASE_URL}/facts/${factId}`);
      setFacts(facts.filter(fact => fact.id !== factId));
    } catch (err) {
      setError(err);
    }
  };

  return { facts, loading, error, createFact, deleteFact };
}
