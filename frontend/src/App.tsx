import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppRoutes from "./components/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-full min-h-screen bg-[#292826] text-[#F9D342]">
        <Header />
        <div className="flex-1 flex flex-col min-h-0">
          <AppRoutes />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}