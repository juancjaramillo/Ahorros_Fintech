import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import { api } from "../api";

jest.mock("../api", () => ({
  api: {
    post: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

test("login admin OK guarda token", async () => {
  api.post.mockResolvedValueOnce({ data: { access_token: "FAKE_TOKEN" } });

  render(
    <MemoryRouter initialEntries={["/admin-login"]}>
      <AdminLogin />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/usuario/i), {
    target: { value: "admin" },
  });
  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
    target: { value: "admin123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/admin/login", {
      username: "admin",
      password: "admin123",
    });
    expect(localStorage.getItem("token")).toBe("FAKE_TOKEN");
  });
});

test("login fail muestra error", async () => {
  api.post.mockRejectedValueOnce({ response: { status: 401, data: { detail: "Invalid credentials" } } });

  render(
    <MemoryRouter initialEntries={["/admin-login"]}>
      <AdminLogin />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/usuario/i), {
    target: { value: "admin" },
  });
  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
    target: { value: "bad" },
  });
  fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

  await waitFor(() => {
    expect(screen.getByText(/credenciales inválidas|invalid credentials/i)).toBeInTheDocument();
  });
});
