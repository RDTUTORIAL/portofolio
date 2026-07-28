import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CardPage from './CardPage';
import './card.scss';

createRoot(document.getElementById('card-root')).render(
  <StrictMode>
    <CardPage />
  </StrictMode>,
);
