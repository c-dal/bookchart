const request = require("supertest");
const app = require("../app");

describe("POST /api/auth/register", () => {
    it("create an account with valid data", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "lecteur@example.com",
                username: "lecteur",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(
            "lecteur@example.com"
        );
        expect(response.body.user.passwordHash).toBeUndefined();
    });

    it("refuse an email address already used", async () => {
        const user = {
            email: "lecteur@example.com",
            username: "lecteur",
            password: "MotDePasse-123!"
        };

        await request(app)
            .post("/api/auth/register")
            .send(user);

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                ...user,
                username: "autrelecteur"
            });

        expect(response.status).toBe(409);
    });

    it("refuse an username already used", async () => {
        const user = {
            email: "lecteur@example.com",
            username: "lecteur",
            password: "MotDePasse-123!"
        };

        await request(app)
            .post("/api/auth/register")
            .send(user);

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                ...user,
                email: "autrelecteur@example.com",
            });

        expect(response.status).toBe(409);
    });

    it("missing value", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                username: "lecteur",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(400);
    });

    it("malformed email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "lecteurexample.com",
                username: "lecteur",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(401);
    });

    it("password too short", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "lecteur@example.com",
                username: "lecteur",
                password: "Mot"
            });

        expect(response.status).toBe(401);
    });

    it("does not return the password hash", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
            email: "lecteur@example.com",
            username: "lecteur",
            password: "MotDePasse-123!"
        });

        expect(response.status).toBe(201);
        expect(response.body.user.passwordHash).toBeUndefined();
    });
});
