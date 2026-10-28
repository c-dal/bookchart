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
    openLibraryId: book.key,
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

module.exports = { searchBooks };