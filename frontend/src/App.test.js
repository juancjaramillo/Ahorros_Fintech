import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

import App from './App';

test('render App sin crashear', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});
