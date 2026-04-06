import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_RELAYER_URL || "http://localhost:5000");
