import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CaseStudy } from './pages/CaseStudy';
import './styles/global.css';
import './styles/pipeline.css';
import './styles/case.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CaseStudy />
  </StrictMode>,
);
