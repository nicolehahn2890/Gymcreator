import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bowlby-one-sc/latin-400.css';
import './ui/theme/fonts.css';
import './ui/theme/tokens.css';
import './ui/theme/base.css';
import './ui/theme/ui.css';
import { App } from './ui/App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
