import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import { BooksProvider } from "./context/BooksContext";

function App() {
  return (
    <BrowserRouter>
      <BooksProvider>
        <main className="app">
          <Header />

          <Routes>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/Library" element={<Library />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Auth />} />
          </Routes>

          <footer className="app-footer"></footer>
        </main>
      </BooksProvider>
    </BrowserRouter>
  );
}

export default App;
