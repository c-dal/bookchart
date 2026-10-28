import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Book from "../pages/Book";

const { authenticatedFetch, rechargerBibliotheque } = vi.hoisted(() => ({
  authenticatedFetch: vi.fn(),
  rechargerBibliotheque: vi.fn(),
}));

vi.mock("../services/authService", () => ({ authenticatedFetch }));
vi.mock("../context/BooksContext", () => ({
  useBooks: () => ({
    livres: [],
    rechargerBibliotheque,
  }),
}));

// Réponse de GET /book/:id (détails du livre)
const detailsLivre = {
  id: "ol-42",
  title: "Fondation",
  authors: ["Isaac Asimov"],
  genres: ["Science-fiction"],
  description: { value: "Une description détaillée." },
  thumbnail: "",
};

function renderBook() {
  return render(
    <MemoryRouter initialEntries={["/book/ol-42"]}>
      <Routes>
        <Route path="/book/:bookid" element={<Book />} />
        <Route path="/home" element={<p>Accueil</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("détail d'un livre", () => {
  beforeEach(() => {
    authenticatedFetch.mockReset();
    rechargerBibliotheque.mockReset();
    rechargerBibliotheque.mockResolvedValue(undefined);
  });

  it("charge un livre, affiche le placeholder et permet l'ajout", async () => {
    // Le composant fait deux appels : un GET (détails) puis un POST (ajout).
    // Chacun doit recevoir une réponse qui ressemble à celle du vrai backend.
    authenticatedFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({
            message: "Livre ajouté à la bibliothèque.",
            book: {
              _id: "mongo-42",
              openLibraryId: "ol-42",
              title: "Fondation",
              status: "TO_READ",
            },
          }),
        };
      }

      return { ok: true, json: async () => detailsLivre };
    });

    renderBook();
    expect(
      await screen.findByRole("heading", { name: "Fondation" })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Aucune couverture disponible")
    ).toBeInTheDocument();
    expect(screen.getByText("Une description détaillée.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter à ma bibliothèque" })
    );

    await waitFor(() => {
      expect(authenticatedFetch).toHaveBeenCalledWith(
        expect.stringContaining("/book/add/ol-42"),
        { method: "POST" }
      );
    });

    // rechargerBibliotheque est appelé après la réponse du POST : on attend.
    await waitFor(() => {
      expect(rechargerBibliotheque).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Livre ajouté à la bibliothèque."
    );
  });

  it("affiche une erreur et ne recharge pas la bibliothèque si l'ajout échoue", async () => {
    authenticatedFetch.mockImplementation(async (_url, options) => {
      if (options?.method === "POST") {
        return {
          ok: false,
          status: 500,
          json: async () => ({
            error: {
              code: "BOOK_ADD_FAILED",
              message: "Impossible d'ajouter le livre à la bibliothèque.",
            },
          }),
        };
      }

      return { ok: true, json: async () => detailsLivre };
    });

    renderBook();
    await screen.findByRole("heading", { name: "Fondation" });

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter à ma bibliothèque" })
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Impossible d'ajouter le livre à la bibliothèque."
    );
    expect(rechargerBibliotheque).not.toHaveBeenCalled();
  });

  it("affiche une erreur lorsque l'API ne charge pas le livre", async () => {
    authenticatedFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    renderBook();

    expect(
      await screen.findByText("Impossible de charger les informations du livre.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Retour à l’accueil/ })
    ).toHaveAttribute("href", "/home");
  });
});