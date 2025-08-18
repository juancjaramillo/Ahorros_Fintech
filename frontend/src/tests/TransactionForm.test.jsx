jest.mock("../api", () => {
  const mockApi = { post: jest.fn(), get: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return { __esModule: true, default: mockApi, api: mockApi };
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionForm from "../components/TransactionForm";
import { api as mockApi } from "../api"; 

beforeEach(() => {
  jest.clearAllMocks();
});

const accounts = [
  { id: 1, number: "0001", balance: 100 },
  { id: 2, number: "0002", balance: 50 },
];

test("deposito OK llama endpoint", async () => {
  const onUpdated = jest.fn();

  mockApi.post.mockResolvedValueOnce({ data: { account_id: 1, balance: 150 } });

  render(<TransactionForm type="deposit" accounts={accounts} onUpdated={onUpdated} />);

  fireEvent.change(screen.getByLabelText(/cuenta/i), { target: { value: "1" } });
  fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "50" } });
  fireEvent.click(screen.getByRole("button", { name: /consignar/i }));

  await waitFor(() => expect(onUpdated).toHaveBeenCalled());
  
  
});

test("retiro insuficiente muestra error", async () => {

  mockApi.post.mockRejectedValueOnce({
    response: { status: 400, data: { detail: "Saldo insuficiente" } },
  });

  render(<TransactionForm type="withdraw" accounts={accounts} />);

  fireEvent.change(screen.getByLabelText(/cuenta/i), { target: { value: "1" } });
  fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "9999" } });
  fireEvent.click(screen.getByRole("button", { name: /retirar/i }));  

  expect(await screen.findByText(/saldo insuficiente/i)).toBeInTheDocument();
});
