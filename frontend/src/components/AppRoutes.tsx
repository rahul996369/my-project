import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Chat from "./Chat";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

