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


describe("GET /api/library", () => {

    const user = {
        email: "lecteur@example.com",
        username: "lecteur",
        password: "MotDePasse-123!"
    };

    let token;
    let bookId;

    beforeEach(async () => {

        await request(app)
            .post("/api/auth/register")
            .send(user);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send(user);

        token = loginResponse.body.token;  

        const addResponse = await request(app)
            .post("/api/book/add/OL45804W")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "TO_READ" });

        bookId = addResponse.body.book._id;

        expect(addResponse.status).toBe(201);
    });

    it("search for books correctly", async () => {
        const response = await request(app)
            .get("/api/library")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].openLibraryId).toBe("OL45804W");
    });

    it("change status to allowed choice", async () => {
        const response = await request(app)
            .patch(`/api/library/${bookId}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "CURRENT" });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("CURRENT");
    });

    it("change status to choice not allowed", async () => {
        const response = await request(app)
            .patch(`/api/library/${bookId}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "WRONG" });;

        expect(response.status).toBe(400);
    });

    it("remove book", async () => {
        const response = await request(app)
            .delete(`/api/library/${bookId}/remove`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        const deletedBook = await LibraryEntry.findById(bookId);
        expect(deletedBook).toBeNull();
    });

    it("do not allow access to another user's book", async () => {
        let token1;
        const user1 = {
            email: "lecteur1@example.com",
            username: "lecteur1",
            password: "MotDePasse!"
        };

        const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(user1);

        const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(user1);
        token1 = loginResponse.body.token;

        const response = await request(app)
            .patch(`/api/library/${bookId}/status`)
            .set("Authorization", `Bearer ${token1}`)
            .send({ status: "FINISHED" });

        expect(response.status).toBe(404);
    });
});