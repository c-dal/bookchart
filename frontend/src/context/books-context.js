import { createContext, useContext } from "react";

export const BooksContext = createContext(null);

export function useBooks() {
    const context = useContext(BooksContext);

    if (!context) {
        throw new Error("useBooks doit être utilisé dans BooksProvider.");
    }

    return context;
}
