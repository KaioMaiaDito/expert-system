import { useState, useEffect } from 'react';
import axios from 'axios';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async project => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/projects',
        project
      );
      setProjects([...projects, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const deleteProject = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/projects/${id}`);
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return { projects, loading, error, createProject, deleteProject };
}
