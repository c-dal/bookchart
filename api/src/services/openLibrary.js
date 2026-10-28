const OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";

const FIELDS = [
  "key",
  "title",
  "author_name",
  "cover_i",
  "author_key",
].join(",");

function createServiceError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

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
    throw createServiceError(
      502,
      "OPEN_LIBRARY_UNAVAILABLE",
      "Open Library est temporairement indisponible."
    );
  }

  const data = await response.json();
  return data.docs ?? [];
}

function scoreBook(book, query) {
  const normalizedQuery = normalize(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  const title = normalize(book.title);
  const authors = (book.author_name ?? []).map(normalize);

  let score = 0;

  if (title === normalizedQuery) {
    score += 100;
  } else if (title.includes(normalizedQuery)) {
    score += 60;
  }

  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 12;
    }

    if (authors.some((author) => author.includes(token))) {
      score += 15;
    }
  }

  const matchedTitleTokens = queryTokens.filter((token) =>
    title.includes(token)
  ).length;

  if (
    queryTokens.length > 1 &&
    matchedTitleTokens === queryTokens.length
  ) {
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

  const searches = [fetchBooks({ q: query }, 10)];

  if (tokens.length >= 2) {
    searches.push(
      fetchBooks({ title: tokens[0] }, 10),
      fetchBooks({ author: tokens[tokens.length - 1] }, 10)
    );
  }

  const results = await Promise.allSettled(searches);

  const successfulResults = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (successfulResults.length === 0) {
    throw createServiceError(
      502,
      "OPEN_LIBRARY_UNAVAILABLE",
      "Toutes les recherches Open Library ont échoué."
    );
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
  if (
    typeof openLibraryId !== "string" ||
    !/^OL\d+W$/.test(openLibraryId)
  ) {
    throw createServiceError(
      400,
      "INVALID_BOOK_ID",
      "Identifiant Open Library invalide."
    );
  }

  const url = `https://openlibrary.org/works/${encodeURIComponent(openLibraryId)}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "BookChart/1.0",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (response.status === 404) {
    throw createServiceError(
      404,
      "BOOK_NOT_FOUND",
      "Livre introuvable sur Open Library."
    );
  }

  if (!response.ok) {
    throw createServiceError(
      502,
      "OPEN_LIBRARY_UNAVAILABLE",
      "Open Library est temporairement indisponible."
    );
  }

  const work = await response.json();

  const description =
    typeof work.description === "string"
      ? work.description
      : work.description?.value ?? null;

  const authorReferences = work.authors ?? [];

  const authors = await Promise.all(
    authorReferences.map(async (reference) => {
      const authorKey = reference.author?.key;

      if (!authorKey) return null;

      try {
        const authorResponse = await fetch(
          `https://openlibrary.org${authorKey}.json`,
          {
            headers: {
              "User-Agent": "BookChart/1.0",
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!authorResponse.ok) return null;

        const author = await authorResponse.json();
        return author.name ?? null;
      } catch {
        return null;
      }
    })
  );

  const genres = await Promise.all(
    (work.genres ?? []).map((genre) => fetchGenreName(genre))
  );

  return {
    openLibraryId,
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
  const key =
    typeof genreReference === "string"
      ? genreReference
      : genreReference?.key;

  // Accepte une référence de tag Open Library ou un nom de genre.
  if (typeof key !== "string") return null;

  if (!key.startsWith("/tags/")) {
    return key.trim() || null;
  }

  const match = key.match(/^\/tags\/(OL\d+T)$/);

  if (!match) return null;

  try {
    const response = await fetch(
      `https://openlibrary.org/tags/${match[1]}.json`,
      {
        headers: {
          "User-Agent": "BookChart/1.0",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return null;

    const tag = await response.json();
    return tag.name ?? null;
  } catch {
    return null;
  }
}

module.exports = { searchBooks, fetchWorkDetails };