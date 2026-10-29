const request = require("supertest");
const app = require("../app");

const User = require("../models/User");

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

        expect(response.status).toBe(401);
    });

    it("malformed email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "lecteurexample.com",
                username: "lecteur",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(400);
    });

    it("password too short", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "lecteur@example.com",
                username: "lecteur",
                password: "Mot"
            });

        expect(response.status).toBe(400);
    });

    it("the email is normalized", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
            email: "Lecteur@Example.com  ",
            username: "lecteur",
            password: "MotDePasse-123!"
        });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe("lecteur@example.com");
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

    it("password gets hashed", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
            email: "lecteur@example.com",
            username: "lecteur",
            password: "MotDePasse-123!"
        });

        const user = await User.findOne({email : "lecteur@example.com"})

        expect(user.passwordHash).toBeTruthy();
        expect(user.passwordHash).not.toBe("MotDePasse-123!")
    });
});


describe("POST /api/auth/login", () => {

    const user = {
        email: "lecteur@example.com",
        username: "lecteur",
        password: "MotDePasse-123!"
    };

    beforeEach(async () => {
        await request(app)
            .post("/api/auth/register")
            .send(user);
    });


    it("login with an existing user", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "lecteur@example.com",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
        expect(typeof response.body.token).toBe("string");
    });

    it("empty email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(400);
    });

    it("empty email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "lecteur@example.com"
            });

        expect(response.status).toBe(400);
    });

    it("empty email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "lecteu@example.com",
                password: "MotDePasse-123!"
            });

        expect(response.status).toBe(401);
    });

    it("empty email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "lecteur@example.com",
                password: "MotDePasse!"
            });

        expect(response.status).toBe(401);
    });
});

describe("test authenticate with JWT", () => {

    const user = {
        email: "lecteur@example.com",
        username: "lecteur",
        password: "MotDePasse-123!"
    };

    beforeEach(async () => {
        await request(app)
            .post("/api/auth/register")
            .send(user);
    });

    it("reject a request without a token", async () => {
        const response = await request(app)
            .get("/api/library");

        expect(response.status).toBe(401);
    });

    it("reject a request with an invalid token", async () => {
        const response = await request(app)
            .get("/api/library")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
    });

});
