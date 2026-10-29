# API BookChart

L'API est un service REST Node.js/Express. Elle gère l'authentification, les bibliothèques des utilisateurs et les échanges avec Open Library.

## Prérequis

- Node.js 22 et npm pour lancer l'API localement, ou Docker Desktop (ou Docker Engine) avec Docker Compose ;
- MongoDB, localement ou via Docker Compose ;
- une connexion Internet pour les recherches et fiches de livres Open Library.

## Configuration

La création des fichiers `.env`, les variables requises et les différences entre exécution locale et Docker Compose sont décrites dans la section [Configuration du README principal](../README.md#configuration).

## Tests et vérification

L'API ne définit actuellement aucun script de test automatisé dans `package.json`. Pour analyser les fichiers avec ESLint depuis la racine du dépôt, lancez la commande dans un conteneur ponctuel :

```powershell
docker compose run --build --rm --no-deps api sh -c "npm install && npm run lint"
```

Cette commande n'a pas besoin de démarrer MongoDB. Pour exécuter ESLint directement sur la machine, depuis le dossier `api` :

```bash
npm ci
npm run lint
```

`npm start` et `npm run dev` restent les commandes pour démarrer l'API ; `npm run lint` ne lance pas le serveur ni ne nécessite MongoDB.

La route de santé permet également de vérifier que le serveur répond, mais l'API ne démarre qu'après une connexion MongoDB réussie.

Après avoir démarré l'API et MongoDB (par exemple avec `docker compose up --build api` depuis la racine), vérifiez <http://localhost:3000/api/health>. La réponse attendue est `{"status":"ok"}`. Pour lancer la vérification de bout en bout de l'application, les tests automatisés disponibles se trouvent dans le [README du frontend](../frontend/README.md#tests).

## Démarrage local

Pour lancer l'API sur la machine hôte, configurez d'abord les variables comme indiqué dans la [configuration générale](../README.md#configuration). Si vous utilisez le service MongoDB du projet, démarrez-le depuis la racine :

```bash
docker compose up -d mongo
```

Puis, depuis le dossier `api`, installez les dépendances et démarrez l'API :

```bash
npm ci
npm start
```

Pour le rechargement automatique pendant le développement, utilisez `npm run dev` à la place de `npm start`.

## Démarrage avec Docker

Depuis la racine du dépôt, démarrez l'API et MongoDB :

```bash
docker compose up --build api
```

Compose exécute `npm install` dans le conteneur avant de lancer l'API, y compris lorsque le volume `node_modules` existe déjà. L'API est disponible sur <http://localhost:3000>. Pour consulter ses journaux :

```bash
docker compose logs -f api
```

Compose démarre également le service MongoDB requis. Pour démarrer l'ensemble de l'application, consultez le [README global](../README.md).

## Routes

Les routes protégées nécessitent un jeton JWT dans l'en-tête HTTP `Authorization`, avec le schéma Bearer. Le jeton est fourni à la connexion et expire après une heure.

| Méthode | Route | Authentification | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Non | Vérifie que l'API répond. |
| `POST` | `/api/auth/register` | Non | Crée un compte (`username`, `email`, `password`). |
| `POST` | `/api/auth/login` | Non | Ouvre une session (`email`, `password`) et renvoie un jeton. |
| `GET` | `/api/library` | Oui | Récupère la bibliothèque de l'utilisateur connecté. |
| `PATCH` | `/api/library/:bookId/status` | Oui | Modifie le statut (`TO_READ`, `CURRENT` ou `FINISHED`). Corps JSON : `{"status":"CURRENT"}`. |
| `DELETE` | `/api/library/:bookId/remove` | Oui | Retire un livre de la bibliothèque. |
| `GET` | `/api/search?q=:query` | Oui | Recherche des livres sur Open Library. La requête est limitée à 200 caractères. |
| `GET` | `/api/book/:openLibraryId` | Oui | Récupère la fiche d'un ouvrage Open Library. |
| `POST` | `/api/book/add/:openLibraryId` | Oui | Ajoute l'ouvrage à la bibliothèque avec le statut initial `TO_READ`. |

Les identifiants d'ouvrage attendus sont des identifiants de type Open Library Work, par exemple `OL123W`.
