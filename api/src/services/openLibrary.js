const OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";

const FIELDS = [
  "key",
  "title",
  "author_name",
  "cover_i",
  "author_key",
].join(",");

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchBooks(params, limit = 10) {
  const searchParams = new URLSearchParams({
    ...params,
    fields: FIELDS,
    limit: String(limit),
    lang: "fr",
  });

  const response = await fetch(
    `${OPEN_LIBRARY_URL}?${searchParams.toString()}`,
    {
      headers: {
        "User-Agent": "BookChart/1.0",
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Open Library a répondu avec le statut ${response.status}`
    );
  }

  const data = await response.json();

  return data.docs ?? [];
}

function scoreBook(book, query) {
  const normalizedQuery = normalize(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  const title = normalize(book.title);
  const authors = (book.author_name ?? [])
    .map(normalize);

  let score = 0;

  // Correspondance du titre complet
  if (title === normalizedQuery) {
    score += 100;
  } else if (title.includes(normalizedQuery)) {
    score += 60;
  }

  // Correspondances des mots du titre
  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 12;
    }

    // Correspondances des mots dans le nom des auteurs
    if (authors.some((author) => author.includes(token))) {
      score += 15;
    }
  }

  // Bonus pour un titre contenant plusieurs mots de la recherche
  const matchedTitleTokens = queryTokens.filter((token) =>
    title.includes(token)
  ).length;

  if (queryTokens.length > 1 &&
    matchedTitleTokens === queryTokens.length) {
    score += 25;
  }

  return score;
}

function mapBook(book) {
  return {
    openLibraryId: book.key.split("/").pop(),
    title: book.title,
    authors: book.author_name ?? [],
    authorKeys: book.author_key ?? [],
    thumbnail: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  };
}

async function searchBooks(search, limit = 10) {
  const query = search.trim();

  if (!query) {
    return { total: 0, books: [] };
  }

  const tokens = query.split(/\s+/).filter(Boolean);

  // Recherche globale : titre, auteur et autres champs indexés
  const searches = [
    fetchBooks({ q: query }, 10),
  ];

  // Recherche complémentaire par titre et auteur pour les saisies
  // qui mélangent des mots du titre et du nom de l'auteur.
  if (tokens.length >= 2) {
    searches.push(
      fetchBooks({ title: tokens[0] }, 10),
      fetchBooks({ author: tokens[tokens.length - 1] }, 10)
    );
  }

  // Si une recherche complémentaire échoue, on conserve les autres
  // résultats dès lors que la recherche globale fonctionne.
  const results = await Promise.allSettled(searches);

  const successfulResults = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (successfulResults.length === 0) {
    throw new Error("Toutes les recherches Open Library ont échoué.");
  }

  const uniqueBooks = new Map();

  for (const docs of successfulResults) {
    for (const book of docs) {
      if (book.key && !uniqueBooks.has(book.key)) {
        uniqueBooks.set(book.key, book);
      }
    }
  }

  const rankedBooks = [...uniqueBooks.values()]
    .map((book) => ({
      book,
      score: scoreBook(book, query),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    total: uniqueBooks.size,
    books: rankedBooks.map(({ book }) => mapBook(book)),
  };
}


async function fetchWorkDetails(openLibraryId) {
  // On accepte uniquement un identifiant de type OL45804W.
  if (!/^OL\d+W$/.test(openLibraryId)) {
    const error = new Error("Identifiant Open Library invalide.");
    error.status = 400;
    throw error;
  }

  const url = `https://openlibrary.org/works/${encodeURIComponent(openLibraryId)}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "BookChart/1.0",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (response.status === 404) {
    const error = new Error("Livre introuvable sur Open Library.");
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Open Library est temporairement indisponible.");
    error.status = 502;
    throw error;
  }

  const work = await response.json();

  // Open Library peut renvoyer la description sous deux formats.
  const description =
    typeof work.description === "string"
      ? work.description
      : work.description?.value ?? null;

  // Les auteurs d'une œuvre sont généralement référencés par leur clé.
  const authorReferences = work.authors ?? [];

  const authors = await Promise.all(
    authorReferences.map(async (reference) => {
      const authorKey = reference.author?.key;

      if (!authorKey) return null;

      try {
        const authorResponse = await fetch(
          `https://openlibrary.org${authorKey}.json`,
          {
            headers: { "User-Agent": "BookChart/1.0" },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!authorResponse.ok) return null;

        const author = await authorResponse.json();
        return author.name ?? null;
      } catch {
        // Un échec sur un auteur ne doit pas empêcher
        // l'affichage du reste de la fiche.
        return null;
      }
    })
  );

  const genres = await Promise.all(
    (work.genres ?? []).map(fetchGenreName)
  );


  return {
    openLibraryId: openLibraryId,
    title: work.title ?? "Titre inconnu",
    description,
    authors: authors.filter(Boolean),
    genres: genres.filter(Boolean),
    thumbnail: work.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
      : null,
    publishedDate: work.first_publish_date ?? null,
  };
}


async function fetchGenreName(genreReference) {
  // Accepte "/tags/OL169T" ou { key: "/tags/OL169T" }
  const key =
    typeof genreReference === "string"
      ? genreReference
      : genreReference?.key;

  const match = key?.match(/^\/tags\/(OL\d+T)$/);

  if (!match) return null;

  const response = await fetch(
    `https://openlibrary.org/tags/${match[1]}.json`,
    {
      headers: { "User-Agent": "BookChart/1.0" },
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) return null;

  const tag = await response.json();
  return tag.name ?? null;
}

module.exports = { searchBooks, fetchWorkDetails };