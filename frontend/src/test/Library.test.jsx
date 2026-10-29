import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Library from "../pages/Library";

const livresInitiaux = () => [
  {
    id: "ol-1",
    mongoId: "mongo-1",
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    genre: "Classique",
    couverture: "https://example.test/prince.jpg",
    resume: "Un voyage poétique.",
    statut: "Lu",
  },
  {
    id: "ol-2",
    mongoId: "mongo-2",
    titre: "Dune",
    auteur: "Frank Herbert",
    genre: "Science-fiction",
    couverture: "",
    resume: "",
    statut: "En cours",
  },
];

// vi.hoisted : ces valeurs doivent exister avant l'exécution de vi.mock,
// qui est remonté tout en haut du fichier par Vitest.
const { changerStatut, supprimerLivre, rechargerBibliotheque, mockContext } =
  vi.hoisted(() => ({
    changerStatut: vi.fn(),
    supprimerLivre: vi.fn(),
    rechargerBibliotheque: vi.fn(),
    mockContext: {
      livres: [],
      loading: false,
      error: "",
    },
  }));

vi.mock("../context/books-context", async (importOriginal) => ({
  ...await importOriginal(),
  useBooks: () => ({
    ...mockContext,
    changerStatut,
    supprimerLivre,
    rechargerBibliotheque,
  }),
}));

describe("bibliothèque", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token-test");
    mockContext.livres = livresInitiaux();
    mockContext.loading = false;
    mockContext.error = "";
    changerStatut.mockReset();
    supprimerLivre.mockReset();
    rechargerBibliotheque.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("affiche les livres et leurs valeurs de remplacement", () => {
    render(<Library />);

    expect(
      screen.getByRole("heading", { name: "Ma bibliothèque" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Le Petit Prince" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dune" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Aucune couverture disponible pour Dune",
      })
    ).toBeVisible();
    expect(screen.getByText("Aucun résumé disponible.")).toBeInTheDocument();
    expect(screen.getByText("Tous les genres")).toBeInTheDocument();
    expect(rechargerBibliotheque).toHaveBeenCalled();
  });

  it("ne recharge pas la bibliothèque sans jeton", () => {
    localStorage.removeItem("token");
    render(<Library />);

    expect(rechargerBibliotheque).not.toHaveBeenCalled();
  });

  it("filtre par genre et trie par auteur", () => {
    render(<Library />);
    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[0], { target: { value: "Science-fiction" } });
    expect(
      screen.queryByRole("heading", { name: "Le Petit Prince" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dune" })).toBeInTheDocument();

    fireEvent.change(selects[0], { target: { value: "tous" } });
    fireEvent.change(selects[1], { target: { value: "az" } });
    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((node) => node.textContent);
    expect(titles).toEqual(["Le Petit Prince", "Dune"]);
  });

  it("affiche le placeholder si une couverture existante échoue", () => {
    render(<Library />);
    const cover = screen.getByRole("img", {
      name: "Couverture de Le Petit Prince",
    });

    fireEvent.error(cover);

    expect(cover).not.toBeVisible();
    expect(
      screen.getByRole("img", {
        name: "Aucune couverture disponible pour Le Petit Prince",
      })
    ).toBeVisible();
  });

  it("confirme la suppression et transmet le changement de statut", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    supprimerLivre.mockResolvedValue({ succes: true });
    changerStatut.mockResolvedValue({ succes: true });
    render(<Library />);

    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    await waitFor(() => {
      expect(supprimerLivre).toHaveBeenCalledWith("mongo-1");
    });

    // Le libellé du composant est « Statut de lecture : » (espace avant les deux-points).
    fireEvent.change(
      screen.getAllByLabelText("Statut de lecture :", { selector: "select" })[0],
      { target: { value: "En cours" } }
    );
    await waitFor(() => {
      expect(changerStatut).toHaveBeenCalledWith("mongo-1", "En cours");
    });
  });

  it("ne supprime pas le livre si la confirmation est refusée", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Library />);

    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);

    expect(supprimerLivre).not.toHaveBeenCalled();
  });

  it("affiche les états de chargement, erreur et liste vide", () => {
    mockContext.loading = true;
    const { rerender } = render(<Library />);
    expect(screen.getByText("Chargement des livres...")).toBeInTheDocument();

    mockContext.loading = false;
    mockContext.error = "Service indisponible";
    rerender(<Library />);
    expect(screen.getByRole("status")).toHaveTextContent("Service indisponible");

    mockContext.error = "";
    mockContext.livres = [];
    rerender(<Library />);
    expect(
      screen.getByText("Aucun livre ne correspond à ces filtres.")
    ).toBeInTheDocument();
  });
});