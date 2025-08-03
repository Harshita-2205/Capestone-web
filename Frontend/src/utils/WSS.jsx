import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "https://notecraftai-xct5.onrender.com";

export const socket = io("http://localhost:10000", {
  autoConnect: false,
});