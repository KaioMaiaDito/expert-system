import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export function useResponsibles() {
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/responsibles`)
      .then(response => {
        setResponsibles(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const createResponsible = async newResponsible => {
    try {
      const response = await axios.post(
        `${BASE_URL}/responsibles`,
        newResponsible
      );
      setResponsibles([...responsibles, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteResponsible = async responsibleId => {
    try {
      await axios.delete(`${BASE_URL}/responsibles/${responsibleId}`);
      setResponsibles(
        responsibles.filter(responsible => responsible.id !== responsibleId)
      );
    } catch (err) {
      setError(err);
    }
  };

  return { responsibles, loading, error, createResponsible, deleteResponsible };
}
