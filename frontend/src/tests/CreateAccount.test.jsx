import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateAccount from '../components/CreateAccount';

jest.mock('../api', () => ({
  __esModule: true,
  api: { post: jest.fn() },
  default: { post: jest.fn() },
}));

import { api } from '../api';

test('crea cuenta envía payload correcto', async () => {
  const onCreated = jest.fn();
  api.post.mockResolvedValueOnce({ data: { id: 99 } });

  render(<CreateAccount clientId={7} clientUsername="client7" onCreated={onCreated} />);

  fireEvent.change(screen.getByPlaceholderText(/0001, cuenta ahorro/i), { target: { value: '0007' } });
  fireEvent.change(screen.getByLabelText(/saldo inicial/i), { target: { value: '123.45' } });
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  await waitFor(() => expect(onCreated).toHaveBeenCalled());

  expect(api.post).toHaveBeenCalledWith('/accounts/', {
    user_id: 7,
    number: '0007',
    initial_balance: 123.45,
  });
});
