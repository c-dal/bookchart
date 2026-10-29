# API BookChart

L'API est un service REST Node.js/Express. Elle gère l'authentification, les bibliothèques des utilisateurs et les échanges avec Open Library.

## Prérequis

- Node.js 22 et npm pour lancer l'API localement, ou Docker Desktop (ou Docker Engine) avec Docker Compose ;
- MongoDB, localement ou via Docker Compose ;
- une connexion Internet pour les recherches et fiches de livres Open Library.

## Configuration

La création des fichiers `.env`, les variables requises et les différences entre exécution locale et Docker Compose sont décrites dans la section [Configuration du README principal](../README.md#configuration).

## Tests et vérification

L'API utilise Jest. Depuis la racine du dépôt, lancez toute la suite dans le conteneur de test :

```powershell
docker compose --profile test run --build --rm api-test
```

Les tests utilisent une base MongoDB en mémoire et simulent les réponses Open Library : il n'est pas nécessaire de lancer MongoDB ou d'avoir accès au réseau pour ces services. Pour les exécuter directement sur la machine, depuis le dossier `api` :

```powershell
npm ci
npm test -- --runInBand
```

`npm run test:watch` lance Jest en mode interactif.

ESLint et Prettier sont exécutés ensemble par le script `lint`. Depuis la racine du dépôt :

```powershell
npm --prefix api ci
npm --prefix api run lint
```

Ou dans le conteneur de test Docker, sans démarrer MongoDB :

```powershell
docker compose --profile test run --build --rm api-test npm run lint
```

La route de santé permet de vérifier que le serveur répond, mais l'API ne démarre qu'après une connexion MongoDB réussie.

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
docker compose up --build -d api
```

L'API de développement est disponible sur <http://localhost:3000>. Pour consulter ses journaux :

```bash
docker compose logs -f api
```

Compose démarre également MongoDB si nécessaire. Pour démarrer l'ensemble du frontend et de l'API en développement, consultez le [README global](../README.md#développement-lancer-et-consulter-lapplication).

Pour démarrer l'API de production avec MongoDB, configurez d'abord `api/.env` comme indiqué dans la [configuration générale](../README.md#configuration), puis lancez depuis la racine :

```powershell
docker compose --profile production up --build -d api-prod
```

L'API est alors disponible sur <http://localhost:3002/api/health>. Pour démarrer aussi l'interface web de production, utilisez plutôt la commande `frontend-prod` du [README global](../README.md#production-locale-lancer-et-consulter-lapplication).

Pour arrêter les services de développement sans supprimer les données persistées :

```powershell
docker compose down
```

Pour arrêter les services de production :

```powershell
docker compose --profile production down
```

N'ajoutez pas `-v` si vous souhaitez conserver les volumes.

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
