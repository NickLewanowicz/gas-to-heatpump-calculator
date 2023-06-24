import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
    />

    {/* <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.12/mvp.css" /> */}
    <Router>
      <Routes>
        <Route path="*" Component={App}></Route>
        {/* Define more routes here */}
      </Routes>
    </Router>
  </StrictMode>
);
