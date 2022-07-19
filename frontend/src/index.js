import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './Store';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <React.StrictMode>
      <StoreProvider>
        <PayPalScriptProvider deferloading={true}>
          <App />
        </PayPalScriptProvider>
      </StoreProvider>
    </React.StrictMode>
  </HelmetProvider>
);
