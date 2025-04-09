import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export function useRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/rules`)
      .then(response => {
        setRules(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const createRule = async newRule => {
    try {
      const response = await axios.post(`${BASE_URL}/rules`, newRule);
      setRules([...rules, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteRule = async ruleId => {
    try {
      await axios.delete(`${BASE_URL}/rules/${ruleId}`);
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (err) {
      setError(err);
    }
  };

  return { rules, loading, error, createRule, deleteRule };
}
