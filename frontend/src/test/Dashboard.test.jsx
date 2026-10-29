import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "../pages/Dashboard";

const { mockContext } = vi.hoisted(() => ({
  mockContext: {
    livres: [],
    loading: false,
    error: "",
    rechargerBibliotheque: vi.fn(),
  },
}));

vi.mock("../context/books-context", async (importOriginal) => ({
  ...(await importOriginal()),
  useBooks: () => mockContext,
}));

describe("tableau de bord", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token-test");
    mockContext.livres = [
      {
        id: "ol-1",
        mongoId: "mongo-1",
        titre: "Le Petit Prince",
        auteur: "Antoine de Saint-Exupéry",
        couverture: "",
        statut: "En cours",
      },
      {
        id: "ol-2",
        mongoId: "mongo-2",
        titre: "Dune",
        auteur: "Frank Herbert",
        couverture: "https://example.test/dune.jpg",
        statut: "Lu",
      },
      {
        id: "ol-3",
        mongoId: "mongo-3",
        titre: "Fondation",
        auteur: "Isaac Asimov",
        couverture: "",
        statut: "À lire",
      },
    ];
    mockContext.loading = false;
    mockContext.error = "";
    mockContext.rechargerBibliotheque.mockReset();
  });

  it("affiche les statistiques et les lectures en cours", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Mon tableau de bord" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Livres lus").nextElementSibling).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByText("En cours de lecture").nextElementSibling,
    ).toHaveTextContent("1");
    expect(
      screen.getByText("Livres à lire").nextElementSibling,
    ).toHaveTextContent("1");
    expect(
      screen.getByRole("heading", { name: "Le Petit Prince" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Aucune couverture disponible pour Le Petit Prince",
      }),
    ).toBeVisible();
    expect(mockContext.rechargerBibliotheque).toHaveBeenCalledTimes(1);
  });

  it("affiche les états de chargement, erreur et catégorie vide", () => {
    mockContext.loading = true;
    mockContext.error = "Bibliothèque indisponible";
    mockContext.livres = [];

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Chargement des livres...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bibliothèque indisponible",
    );
    expect(
      screen.getByText("Aucun livre dans cette catégorie."),
    ).toBeInTheDocument();
  });
});
