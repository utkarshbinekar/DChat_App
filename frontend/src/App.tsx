import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import ChatLayout from "./layout/ChatLayout";
import ChatOpen from "./pages/ChatOpen";
import { WalletProvider } from "./context/WalletContext";

export default function App() {
  return (
    <WalletProvider>
      <main className="flex-1 flex flex-col h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ChatLayout />}>
            <Route index path="/chat" element={<Chat />} />
            <Route index path="/chat/:address" element={<ChatOpen />} />
          </Route>
        </Routes>
        <Footer />
        <ToastContainer />
      </main>
    </WalletProvider>
  );
}
