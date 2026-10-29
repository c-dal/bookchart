# Frontend BookChart

L'interface BookChart est une application React construite avec Vite. Elle permet de créer un compte, de rechercher des livres, de consulter leur fiche et de gérer sa bibliothèque personnelle.

## Prérequis

- Docker Desktop (ou Docker Engine) avec Docker Compose est la méthode recommandée pour lancer et vérifier le projet ;
- Node.js 22 et npm sont nécessaires uniquement si vous préférez exécuter Vite et ses vérifications directement sur la machine.

## Configuration

La création des fichiers `.env`, la variable `VITE_API_URL` et son rôle sont décrits dans la section [Configuration du README principal](../README.md#configuration). L'adresse de l'API configurée doit être joignable depuis le navigateur, y compris quand Vite tourne dans Docker.

## Tests

Depuis la racine du dépôt, lancez les tests, ESLint et le build dans un conteneur ponctuel. Cette commande reconstruit l'image si nécessaire, installe les dépendances dans le conteneur et ne démarre pas l'API ni MongoDB :

```powershell
docker compose run --build --rm --no-deps frontend sh -c "npm install && npm test && npm run lint && npm run build"
```

Pour exécuter uniquement les tests :

```powershell
docker compose run --build --rm --no-deps frontend sh -c "npm install && npm test"
```

Les tests utilisent des réponses API simulées : il n'est pas nécessaire de démarrer l'API ou MongoDB. Pour le mode interactif pendant le développement, lancez `npm run test:watch` dans un conteneur frontend déjà démarré :

```powershell
docker compose exec frontend npm run test:watch
```

### Exécution locale sans Docker

Si vous choisissez de lancer les commandes sur la machine hôte, depuis le dossier `frontend` :

```bash
npm ci
npm test
npm run lint
npm run build
```

Mode interactif local :

```bash
npm run test:watch
```

## Démarrage avec Docker

Depuis la racine du dépôt, démarrez le frontend et ses dépendances :

```bash
docker compose up --build frontend
```

Compose exécute `npm install` dans le conteneur avant de lancer Vite. Ouvrez <http://localhost:5173>. Compose démarre aussi l'API et MongoDB.

Pour exécuter les vérifications dans un conteneur frontend déjà démarré :

| Commande | Description |
| --- | --- |
| `docker compose exec frontend npm test` | Exécute la suite Vitest. |
| `docker compose exec frontend npm run lint` | Exécute ESLint. |
| `docker compose exec frontend npm run build` | Génère la version de production dans `dist/`. |

## Parcours principaux

- Créer un compte ou se connecter ; la session utilise un jeton conservé dans le stockage local du navigateur.
- Rechercher un livre et consulter sa fiche détaillée.
- Ajouter un livre à sa bibliothèque, puis filtrer, trier, modifier son statut de lecture ou le supprimer.
- Consulter le tableau de bord et les statistiques de lecture.

Les statuts affichés dans l'interface (« À lire », « En cours », « Lu ») sont convertis en statuts API (`TO_READ`, `CURRENT`, `FINISHED`).

Pour démarrer frontend, API et MongoDB ensemble, consultez le [README global](../README.md).
