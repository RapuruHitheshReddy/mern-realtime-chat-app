import { io } from "socket.io-client";

let socket = null;

// Derive socket URL from API base URL
// Example: http://localhost:5000/api → http://localhost:5000
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
