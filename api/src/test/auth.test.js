const request = require("supertest");
const app = require("../app");

describe("POST /api/auth/register", () => {
    it("crée un compte avec des données valides", async () => {
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

    it("refuse une adresse e-mail déjà utilisée", async () => {
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
});
