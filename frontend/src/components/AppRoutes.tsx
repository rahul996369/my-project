import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Chat from "./Chat";

export default function AppRoutes() {
  return (
    <div className="flex-1 flex flex-col min-h-0 route-outlet">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={
          <div className="flex-1 flex flex-col min-h-0 h-full">
            <Chat />
          </div>
        } />
      </Routes>
    </div>
  );
}

