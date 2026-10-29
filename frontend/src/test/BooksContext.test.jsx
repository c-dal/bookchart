import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BooksProvider, useBooks } from "../context/BooksContext";

const { authenticatedFetch } = vi.hoisted(() => ({
  authenticatedFetch: vi.fn(),
}));
vi.mock("../services/authService", () => ({ authenticatedFetch }));

function Probe() {
  const { livres, loading, error, changerStatut, supprimerLivre } = useBooks();
  return (
    <>
      <output data-testid="loading">{String(loading)}</output>
      <output data-testid="error">{error}</output>
      <ul>
        {livres.map((livre) => <li key={livre.id}>{livre.titre} - {livre.statut}</li>)}
      </ul>
      <button onClick={() => changerStatut("mongo-1", "En cours")}>Changer</button>
      <button onClick={() => supprimerLivre("mongo-1")}>Supprimer</button>
    </>
  );
}

describe("BooksProvider", () => {
  it("charge, transforme puis met à jour et supprime un livre", async () => {
    authenticatedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          books: [{
            _id: "mongo-1",
            openLibraryId: "ol-1",
            title: "Le Petit Prince",
            authors: ["Antoine de Saint-Exupéry"],
            genres: ["Classique"],
            status: "FINISHED",
          }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ book: { status: "CURRENT" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Supprimé" }),
      });
    localStorage.setItem("token", "token-test");
    render(<BooksProvider><Probe /></BooksProvider>);

    expect(await screen.findByText("Le Petit Prince - Lu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Changer" }));
    expect(await screen.findByText("Le Petit Prince - En cours")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(screen.queryByText(/Le Petit Prince/)).not.toBeInTheDocument());
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("expose une erreur lorsque le chargement échoue", async () => {
    authenticatedFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "API indisponible" }),
    });
    localStorage.setItem("token", "token-test");
    render(<BooksProvider><Probe /></BooksProvider>);

    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent(
      "Impossible de charger la bibliothèque."
    ));
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });
});
