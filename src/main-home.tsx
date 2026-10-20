import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from './pages/Home';
import './styles/global.css';
import './styles/pipeline.css';
import './styles/home.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
