
import { useState } from "react";
import logo from "../assets/bookchart_logo_auth.png";
import { registerUser, loginUser } from "../services/authService";
import "./Auth.css";

function Auth() {
  const [mode, setMode] = useState("connexion");

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Vérification des mots de passe lors de l'inscription
    if (mode === "inscription" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "inscription") {
        await registerUser({
          username: pseudo,
          email: email,
          password: password,
        });

        setSuccess("Ton compte a été créé avec succès !");
        setPseudo("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await loginUser({
          email: email,
          password: password,
        });
        console.log("Réponse de connexion :", data);
        //on stock le token de connexion de l'utilisateur s'il y en a un(pour l'instant a ajouter par la suite au const data await loginUser)
        if(data.token) {
            localStorage.setItem("token", data.token);
        }

        setSuccess(data.message || "Connexion réussie !");
        
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  function changeMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Bienvenue sur BookChart</h1>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "connexion" ? "active" : ""}
            onClick={() => changeMode("connexion")}
          >
            Connexion
          </button>

          <button
            type="button"
            className={mode === "inscription" ? "active" : ""}
            onClick={() => changeMode("inscription")}
          >
            Inscription
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "inscription" && (
            <div className="form-group">
              <label htmlFor="signup-pseudo">Pseudo</label>
              <input
                id="signup-pseudo"
                name="pseudo"
                type="text"
                placeholder="Choisis un pseudo"
                autoComplete="username"
                value={pseudo}
                onChange={(event) => setPseudo(event.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Adresse e-mail</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="exemple@email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Mot de passe</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder="Ton mot de passe"
              autoComplete={
                mode === "inscription"
                  ? "new-password"
                  : "current-password"
              }
              minLength={mode === "inscription" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {mode === "inscription" && (
            <div className="form-group">
              <label htmlFor="confirm-password">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Répète ton mot de passe"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />
            </div>
          )}

          {error && (
            <p className="auth-message auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-message auth-success" role="status">
              {success}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Chargement..."
              : mode === "connexion"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>
      </section>

      <section className="auth-brand">
        <img src={logo} alt="Logo BookChart" />
      </section>
    </main>
  );
}

export default Auth;
