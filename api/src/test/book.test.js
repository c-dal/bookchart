const request = require("supertest");
jest.mock("../services/openLibrary", () => ({
    fetchWorkDetails: jest.fn(async (openLibraryId) => ({
        openLibraryId,
        title: "Test book",
        authors: [],
        genres: [],
    })),
    searchBooks: jest.fn(),
}));

const app = require("../app");

const LibraryEntry = require("../models/LibraryEntry");


describe("GET /api/book", () => {

    const user = {
        email: "lecteur@example.com",
        username: "lecteur",
        password: "MotDePasse-123!"
    };

    beforeEach(async () => {
        await request(app)
            .post("/api/auth/register")
            .send(user);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(user);
        token = loginResponse.body.token;  
    });

    it("add book to library", async () => {
        const response = await request(app)
            .post("/api/book/add/OL45804W")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "TO_READ" });

        expect(response.status).toBe(201);
        expect(response.body.book.status).toBe("TO_READ");
    });
    
    it("prevent adding the same book twice", async () => {
        const firstResponse = await request(app)
            .post("/api/book/add/OL45804W")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "TO_READ" });

        const secondResponse = await request(app)
            .post("/api/book/add/OL45804W")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "TO_READ" });

        expect(firstResponse.status).toBe(201);
        expect(secondResponse.status).toBe(409);
    });

    it("do not accept invalid book id", async () => {
        const response = await request(app)
            .post("/api/book/add/ewisjsdojfozd")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "TO_READ" });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("INVALID_BOOK_ID");
    });

    it("do not accept status outside of predefined ones", async () => {
        const response = await request(app)
            .post("/api/book/add/OL45804W")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "WRONG" });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("INVALID_STATUS");
    });
        
});