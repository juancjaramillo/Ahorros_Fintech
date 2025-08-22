// src/components/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AdminLogin() {
  const isDev = process.env.NODE_ENV === "development";
  const [username, setUsername] = useState(isDev ? "admin" : "");
  const [password, setPassword] = useState(isDev ? "admin123" : "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/admin/login", { username, password });
      const token = data?.access_token;
      if (token) {
        localStorage.setItem("token", token);
        // El interceptor enviará Authorization en pedidos siguientes
      }
      navigate("/admin");
    } catch (err) {
      console.error("AdminLogin error:", err);
      setError("Credenciales inválidas");
    }
  };

  return (
    <div>
      <form onSubmit={submit} style={{ maxWidth: 350, margin: "2rem auto" }}>
        <h4>Administrador</h4>
        <input
          aria-label="Usuario"
          className="form-control mb-2"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          aria-label="Contraseña"
          className="form-control mb-2"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100" type="submit">Ingresar</button>
        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}
