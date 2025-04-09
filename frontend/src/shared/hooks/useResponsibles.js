import { useState, useEffect } from 'react';
import axios from 'axios';

export function useResponsibles() {
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResponsibles = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/responsibles'
      );
      setResponsibles(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsibles();
  }, []);

  const createResponsible = async responsible => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/responsibles',
        responsible
      );
      setResponsibles([...responsibles, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteResponsible = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/responsibles/${id}`);
      setResponsibles(responsibles.filter(r => r.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return { responsibles, loading, error, createResponsible, deleteResponsible };
}
