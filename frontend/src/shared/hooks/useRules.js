import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRules = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rules');
      setRules(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const createRule = async rule => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/rules',
        rule
      );
      setRules([...rules, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteRule = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/rules/${id}`);
      setRules(rules.filter(rule => rule.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return { rules, loading, error, createRule, deleteRule };
}
