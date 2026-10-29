import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const { loginUser } = vi.hoisted(() => ({ loginUser: vi.fn() }));

vi.mock("../services/authService", () => ({
  loginUser,
  registerUser: vi.fn(),
  authenticatedFetch: vi.fn(),
}));

vi.mock("../context/BooksContext", () => ({
  BooksProvider: ({ children }) => children,
}));

vi.mock("../context/books-context", async (importOriginal) => ({
  ...(await importOriginal()),
  useBooks: () => ({
    livres: [],
    loading: false,
    error: "",
    rechargerBibliotheque: vi.fn(),
    ajouterLivre: vi.fn(),
    changerStatut: vi.fn(),
    supprimerLivre: vi.fn(),
  }),
}));

describe("navigation et authentification", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/home");
    loginUser.mockReset();
  });

  it("redirige une route protégée vers la connexion sans jeton", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Bienvenue sur BookChart" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeVisible();
  });

  it("connecte l'utilisateur et affiche le tableau de bord", async () => {
    loginUser.mockResolvedValue({ token: "token-test" });
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    render(<App />);

    await fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "user@example.test" },
    });
    await fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Mon tableau de bord" }),
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem("token")).toBe("token-test");
    expect(loginUser).toHaveBeenCalledWith({
      email: "user@example.test",
      password: "password",
    });
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth-changed" }),
    );
  });

  it("affiche l'erreur renvoyée par l'API de connexion", async () => {
    loginUser.mockRejectedValue(new Error("Identifiants incorrects."));
    render(<App />);

    await fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "wrong@example.test" },
    });
    await fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants incorrects.",
    );
    expect(localStorage.getItem("token")).toBeNull();
  });
});
