import { state } from "./state";

const API = "http://localhost:8000";

export async function register(email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function createRoom(name: string) {
  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.token}` 
    },
    body: JSON.stringify({ name })
  });
  
  if (!res.ok) {
    throw new Error(`Failed to create room: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function listRooms() {
  const res = await fetch(`${API}/rooms`, {
    headers: { 
      Authorization: `Bearer ${state.token}` 
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to list rooms: ${res.status}`);
  }
  
  return res.json();
}

export async function joinRoom(roomId: string) {
  const res = await fetch(`${API}/rooms/${roomId}/join`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${state.token}` 
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to join room: ${res.status}`);
  }
  
  return res.json();
}
