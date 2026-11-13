import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ResumePage } from './pages/ResumePage';
import './styles/global.css';
import './styles/case.css';
import './styles/resume.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResumePage />
  </StrictMode>,
);
