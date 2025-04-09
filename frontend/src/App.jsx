import InitialScreen from './shared/components/InitialScreen';
import Dashboard from './shared/components/Dashboard';
import ProjectList from './shared/components/ProjectList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
      </Routes>
    </Router>
  );
}

export default App;
