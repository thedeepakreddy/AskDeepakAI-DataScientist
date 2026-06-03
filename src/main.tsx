import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PipelineProvider } from './contexts/PipelineContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PipelineProvider>
      <App />
    </PipelineProvider>
  </StrictMode>,
);
