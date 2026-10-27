import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Auth from "./pages/Auth";
import Library from "./pages/Library";

function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <Header />

        <Routes>
          <Route path="/home" element={<Auth />} />
          <Route path="/Library" element={<Library />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>

        <footer className="app-footer"></footer>
      </main>
    </BrowserRouter>
  );
}

export default App;
