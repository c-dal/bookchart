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

Dans `api/.env`, définissez `JWT_SECRET_KEY` avec une clé privée non triviale et `CORS_ORIGIN=http://localhost:5173` pour le développement local. Compose configure automatiquement l'origine du frontend de production sur `http://localhost:5174`. Vous pouvez générer une clé JWT avec :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Pour Docker Compose, `PORT` et `MONGODB_URI` sont fournis par Compose. Pour lancer l'API directement sur la machine, utilisez une URI MongoDB accessible depuis celle-ci, par exemple `mongodb://127.0.0.1:27017/bookchart`.

Dans `frontend/.env`, `VITE_API_URL` est l'URL de base de l'API avec le préfixe `/api`, par exemple `http://localhost:3000/api` en développement. Le navigateur doit pouvoir joindre l'adresse configurée.

## Développement : lancer et consulter l'application

Prérequis : Docker Desktop (ou Docker Engine) avec Docker Compose. Depuis la racine du dépôt, lancez le frontend, l'API et MongoDB :

```powershell
docker compose up --build -d
```

Ouvrez l'interface sur <http://localhost:5173>. L'API est disponible sur <http://localhost:3000> et son endpoint de santé sur <http://localhost:3000/api/health>. MongoDB est exposé sur `localhost:27017`.

L'option `-d` lance les services en arrière-plan. Pour les garder au premier plan dans le terminal, retirez `-d` ; `Ctrl+C` les arrête. Pour consulter les journaux :

```powershell
docker compose logs -f
```

## Production locale : lancer et consulter l'application

Le profil `production` construit et lance le frontend statique, l'API optimisée et MongoDB. Il peut être démarré indépendamment du mode développement :

```powershell
docker compose --profile production up --build -d frontend-prod
```

Ouvrez l'interface sur <http://localhost:5174>. Le frontend de production appelle l'API sur le port `3002` ; son endpoint de santé est <http://localhost:3002/api/health>. Les ports de production sont séparés des ports de développement (`5173` et `3000`).

L'API de production lit `api/.env`. Si le fichier n'existe pas, créez-le à partir du modèle puis définissez une clé JWT privée :

```powershell
Copy-Item api\.env.example api\.env
```

Si un ancien conteneur autonome nommé `bookchart-api-prod` occupe encore un nom ou un réseau, supprimez-le une fois :

```powershell
docker rm -f bookchart-api-prod
```

Cette commande supprime uniquement ce conteneur, pas les volumes. Compose nomme désormais son conteneur API de production `bookchart-api-prod-1`.

## Tests

Les tests du backend s'exécutent dans un conteneur dédié, sans dépendre d'Open Library :

```powershell
docker compose --profile test run --build --rm api-test
```

Les tests du frontend peuvent être exécutés directement depuis la racine :

```powershell
npm --prefix frontend test
```

## ESLint et Prettier

Le script `lint` de chaque application lance ESLint puis Prettier en vérification (`--check`). Depuis la racine, installez les dépendances si nécessaire, puis lancez les vérifications :

```powershell
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix api ci
npm --prefix api run lint
```

Le volume Docker `node_modules` peut conserver une ancienne installation après un changement de dépendances. Dans ce cas, synchronisez-la avec `npm install` dans le service avant de lancer son lint.

Pour vérifier ESLint et Prettier du backend dans Docker, sans démarrer l'API ni MongoDB :

```powershell
docker compose --profile test run --build --rm api-test npm run lint
```

Pour lancer les tests, ESLint et le build du frontend dans son conteneur :

```powershell
docker compose run --build --rm --no-deps frontend sh -c "npm install && npm run lint && npm run build"
```

Consultez les README de [l'API](./api/README.md) et du [frontend](./frontend/README.md) pour les commandes propres à chaque service.

## Arrêter les conteneurs sans effacer les données

Arrêtez les conteneurs du mode développement :

```powershell
docker compose down
```

Arrêtez ceux du profil de production :

```powershell
docker compose --profile production down
```

Ces commandes arrêtent et suppriment les conteneurs et le réseau Compose, mais conservent les volumes nommés, notamment les données MongoDB et les dépendances. **N'ajoutez pas `-v`** si vous souhaitez garder ces données.

Pour une réinitialisation complète du développement, qui supprime aussi les volumes et les données MongoDB :

```powershell
docker compose down -v
```

Pour arrêter également les services de production et supprimer les volumes :

```powershell
docker compose --profile production down -v
```

Consultez l'état des services avec `docker compose ps` ou `docker compose --profile production ps`.
