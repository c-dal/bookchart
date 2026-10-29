const request = require("supertest");
jest.mock("../services/openLibrary", () => ({
    fetchWorkDetails: jest.fn(),
    searchBooks: jest.fn(async () => ({ total: 0, books: [] })),
}));

const app = require("../app");

describe("GET /api/search", () => {
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

    it("search books by author", async () => {
        const response = await request(app)
            .get("/api/search?q=William%20Golding")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.books).toBeDefined();
    });

    it("search books by name", async () => {
        const response = await request(app)
            .get("/api/search?q=Lord%20of%20the%20Flies")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.books).toBeDefined();
    });

    it("reject a missing search query", async () => {
        const response = await request(app)
            .get("/api/search")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
    });

    it("reject a too long search query", async () => {
        const longQuery = "a".repeat(201);
        const response = await request(app)
            .get("/api/search?")
            .query({ q: longQuery })
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
    });

    it("handle a search with no results", async () => {
        const response = await request(app)
            .get("/api/search?q=zzzxxyy123")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.books).toEqual([]);
    });
});