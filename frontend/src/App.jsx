import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Header from "./components/Header";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import Book from "./pages/Book";
import { BooksProvider } from "./context/BooksContext";

function estConnecte() {
  return Boolean(localStorage.getItem("token"));
}

function RouteProtegee() {
  return estConnecte() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RouteConnexion() {
  return estConnecte() ? <Navigate to="/home" replace /> : <Auth />;
}

function App() {
  return (
    <BrowserRouter>
      <BooksProvider>
        <main className="app">
          <Header />

          <Routes>
            <Route path="/login" element={<RouteConnexion />} />

            <Route element={<RouteProtegee />}>
              <Route path="/home" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/book/:bookid" element={<Book />} />
            </Route>

            <Route
              path="/"
              element={
                <Navigate to={estConnecte() ? "/home" : "/login"} replace />
              }
            />

            <Route
              path="*"
              element={
                <Navigate to={estConnecte() ? "/home" : "/login"} replace />
              }
            />
          </Routes>

          <footer className="app-footer"></footer>
        </main>
      </BooksProvider>
    </BrowserRouter>
  );
}

export default App;
