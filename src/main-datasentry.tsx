import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DataSentryStudy } from './pages/DataSentryStudy';
import './styles/global.css';
import './styles/case.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataSentryStudy />
  </StrictMode>,
);
