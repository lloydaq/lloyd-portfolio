import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CampusSignalStudy } from './pages/CampusSignalStudy';
import './styles/global.css';
import './styles/case.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CampusSignalStudy />
  </StrictMode>,
);
