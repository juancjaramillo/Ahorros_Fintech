import axios from "axios";

/*  Usa la variable de entorno que definiremos en .env  */
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,   // ← http://IP/api
});
