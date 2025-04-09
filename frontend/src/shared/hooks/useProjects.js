import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega todos os projetos assim que o hook é utilizado
  useEffect(() => {
    axios
      .get(`${BASE_URL}/projects`)
      .then(response => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Função para criar um novo projeto
  const createProject = async newProject => {
    try {
      const response = await axios.post(`${BASE_URL}/projects`, newProject);
      setProjects([...projects, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  // Função para deletar um projeto
  const deleteProject = async projectId => {
    try {
      await axios.delete(`${BASE_URL}/projects/${projectId}`);
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (err) {
      setError(err);
    }
  };

  return { projects, loading, error, createProject, deleteProject };
}
