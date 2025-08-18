import React, { useState } from "react";
import { api } from "../api";

export default function CreateClient({ onCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

 
  async function existsUsername(u) {
    try {
      const { data } = await api.get("/users");
      const target = (u || "").trim().toLowerCase();
      return Array.isArray(data) && data.some(
        (x) => (x?.username || "").toLowerCase() === target
      );
    } catch {
     
      return false;
    }
  }

  
  async function createClient(payload) {
    try {
      return await api.post("/clients", payload);
    } catch (e1) {
      const s1 = e1?.response?.status;
      if (s1 !== 404 && s1 !== 405) throw e1;
      try {
        return await api.post("/users", payload);
      } catch (e2) {
        const s2 = e2?.response?.status;
        if (s2 !== 404 && s2 !== 405) throw e2;
        return await api.post("/users/", payload);
      }
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
   
      if (await existsUsername(username)) {
        setErr("Ese usuario ya existe.");
        return;
      }

    
      await createClient({ username, password, role: "client" });

    
      setUsername("");
      setPassword("");
      onCreated?.();
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d?.msg || d?.message || String(d)).join(", ")
          : error?.response?.data?.message || "No fue posible crear el cliente.";
      setErr(msg);
      console.error("CreateClient error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="row g-2 align-items-end">
      {err && <div className="alert alert-danger w-100">{err}</div>}

      <div className="col-md-4">
        <label className="form-label">Usuario</label>
        <input
          className="form-control"
          placeholder="usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">Password</label>
        <input
          className="form-control"
          type="password"
          placeholder="Password123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="col-md-auto">
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear Cliente"}
        </button>
      </div>
    </form>
  );
}
