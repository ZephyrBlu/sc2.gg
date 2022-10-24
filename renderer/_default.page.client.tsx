import React from 'react';
import ReactDOM from 'react-dom/client';
import {PageContextBuiltIn} from 'vite-plugin-ssr';

export async function render(pageContext: PageContextBuiltIn) {
  const {Page} = pageContext;

  ReactDOM
    .createRoot(document.getElementById('root') as HTMLElement)
    .render(
      <React.StrictMode>
        <Page />
      </React.StrictMode>,
  );
}
