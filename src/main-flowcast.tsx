import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FlowCastStudy } from './pages/FlowCastStudy';
import './styles/global.css';
import './styles/case.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlowCastStudy />
  </StrictMode>,
);
