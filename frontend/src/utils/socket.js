import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const initializeSocket = () => {
  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  return socket;
};

export default socket;
