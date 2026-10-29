# BookChart

BookChart est une application de gestion de bibliothèque personnelle. Elle permet de créer un compte, de rechercher des livres via [Open Library](https://openlibrary.org/), de les ajouter à sa bibliothèque et de suivre leur statut de lecture.

Le projet comprend :

- `frontend/` : interface React avec Vite ;
- `api/` : API REST Node.js/Express ;
- MongoDB : stockage des comptes et des bibliothèques.

## Configuration

Les fichiers `.env` ne sont pas suivis par Git. Créez-les à partir des exemples, sans écraser un fichier déjà configuré :

```powershell
if (-not (Test-Path api\.env)) { Copy-Item api\.env.example api\.env }
if (-not (Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env }
```

`api/.env` doit contenir les quatre variables de `api/.env.example` : `MONGODB_URI`, `PORT`, `JWT_SECRET_KEY` et `CORS_ORIGIN`. Remplacez la clé JWT d'exemple par une valeur privée et configurez l'URI MongoDB selon le mode de lancement. Pour générer une clé JWT : ```node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"```. Pour le lancement Docker Compose ci-dessous, Compose surcharge `MONGODB_URI` et `PORT` avec les valeurs du conteneur MongoDB et `3000`. Pour lancer l'API directement sur la machine, utilisez une URI MongoDB accessible depuis celle-ci (par exemple `mongodb://127.0.0.1:27017/bookchart`).

`frontend/.env` doit contenir `VITE_API_URL`, l'URL de base de l'API avec le préfixe `/api`, par exemple `http://localhost:3000/api`. Vite lit cette variable depuis le fichier `.env` du frontend ; le navigateur doit pouvoir joindre l'adresse configurée.

## Lancer toute l'application avec Docker

Prérequis : Docker Desktop (ou Docker Engine) avec Docker Compose.

Depuis la racine du dépôt, lancez toute l'application :

```bash
docker compose up --build
```

Compose démarre MongoDB, puis l'API et le frontend. L'API charge `api/.env` via `dotenv`, mais Compose lui fournit directement `PORT=3000` et `MONGODB_URI=mongodb://mongo:27017/bookchart`, qui prennent le pas sur les valeurs du fichier. Vite charge `frontend/.env`. Les commandes Compose installent les dépendances des services avant leur démarrage. Il n'est pas nécessaire d'installer Node.js ou npm sur la machine hôte pour ce mode de lancement. Une fois les services démarrés :

- Interface : <http://localhost:5173>
- API : <http://localhost:3000>
- MongoDB : `localhost:27017`

L'API attend que MongoDB soit prêt avant de démarrer. Les données MongoDB sont conservées dans le volume Docker `mongo_data` après l'arrêt des conteneurs.

Pour arrêter les services :

```bash
docker compose down
```

Pour suivre les journaux :

```bash
docker compose logs -f
```

## Tests et vérifications

Les instructions de tests et de vérification sont propres à chaque service : consultez le [README du frontend](./frontend/README.md#tests) et le [README de l'API](./api/README.md#tests-et-vérification).

## Commandes Docker utiles

Depuis la racine du dépôt :

| Action | Commande |
| --- | --- |
| Démarrer / reconstruire tous les services | `docker compose up --build` |
| Démarrer seulement l'API et MongoDB | `docker compose up --build api` |
| Démarrer le frontend avec ses dépendances | `docker compose up --build frontend` |
| Voir les journaux | `docker compose logs -f` |
| Arrêter les services | `docker compose down` |
| Arrêter les services et supprimer les volumes (réinitialisation) | `docker compose down -v` |

## Documentation des services

- [API](./api/README.md) : configuration, exécution et routes disponibles.
- [Frontend](./frontend/README.md) : configuration, commandes et fonctionnement de l'interface.
