import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Screening from './pages/Screening';
import Diagnosis from './pages/Diagnosis';
import Therapy from './pages/Therapy';
import Monitoring from './pages/Monitoring';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <LandingPage />
          </Layout>
        } />
        <Route path="/screening" element={
          <Layout>
            <Screening />
          </Layout>
        } />
        <Route path="/diagnosis" element={
          <Layout>
            <Diagnosis />
          </Layout>
        } />
        <Route path="/therapy" element={
          <Layout>
            <Therapy />
          </Layout>
        } />
        <Route path="/monitoring" element={
          <Layout>
            <Monitoring />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
