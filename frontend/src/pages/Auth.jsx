import { useState } from "react";
import logo from "../assets/bookchart_logo_auth.png";

function Auth() {
  const [mode, setMode] = useState("connexion");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Bienvenue sur BookChart</h1>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "connexion" ? "active" : ""}
            onClick={() => setMode("connexion")}
          >
            Connexion
          </button>

          <button
            type="button"
            className={mode === "inscription" ? "active" : ""}
            onClick={() => setMode("inscription")}
          >
            Inscription
          </button>
        </div>

        {mode === "connexion" ? (
          <form
            className="auth-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="form-group">
              <label htmlFor="login-email">Adresse e-mail</label>
              <input
                id="login-email"
                type="email"
                placeholder="exemple@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                placeholder="Ton mot de passe"
                required
              />
            </div>

            <button className="auth-submit" type="submit">
              Se connecter
            </button>
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="form-group">
              <label htmlFor="signup-pseudo">Pseudo</label>
              <input
                id="signup-pseudo"
                name="pseudo"
                type="text"
                placeholder="Choisis un pseudo"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Adresse e-mail</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="exemple@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Mot de passe</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm-password">
                Confirmer le mot de passe
              </label>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Répète ton mot de passe"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button className="auth-submit" type="submit">
              Créer mon compte
            </button>
          </form>
        )}
      </section>

      <section className="auth-brand">
        <img src={logo} alt="Logo BookChart" />
      </section>
    </main>
  );
}

export default Auth;