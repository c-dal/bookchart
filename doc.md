# Utiliser Docker

Lancer les commandes depuis la racine du projet. Les volumes nommés de Docker conservent les données MongoDB et les dépendances entre les démarrages, tant qu'on ne passe pas l'option `-v` à `docker compose down`.

## Développement : consulter l'application en local

Construire les images et démarrer le frontend, l'API et MongoDB :

```powershell
docker compose up --build -d
```

Ouvrir ensuite <http://localhost:5173>. L'API de développement est disponible sur <http://localhost:3000/api/health>. L'option `-d` lance les services en arrière-plan. Pour les garder au premier plan dans le terminal, retirer `-d` ; `Ctrl+C` les arrête.

## Production : consulter l'application en local

Le profil `production` construit et démarre le frontend statique, l'API optimisée et MongoDB :

```powershell
docker compose --profile production up --build -d frontend-prod
```

Ouvrir l'application sur <http://localhost:5174>. Le frontend de production appelle l'API sur le port `3002`. On peut vérifier séparément que l'API répond sur <http://localhost:3002/api/health> ; la réponse attendue est `{"status":"ok"}`. Ces ports évitent les ports de développement `5173` et `3000`, ainsi que l'ancien port de production `3001`. La commande démarre aussi MongoDB si nécessaire ; il n'est pas nécessaire de lancer le mode développement avant.

Le service de production lit les variables de `api/.env`. Si ce fichier n'existe pas, le créer à partir du modèle, puis remplacer les valeurs d'exemple :

```powershell
Copy-Item api\.env.example api\.env
```

En particulier, `JWT_SECRET_KEY` doit avoir une valeur locale non triviale.

## Tests de l'API

Construire l'image de test et lancer Jest :

```powershell
docker compose --profile test run --build --rm api-test
```

Le conteneur de test est supprimé à la fin. Les volumes du projet ne sont pas supprimés.

## Arrêter les conteneurs sans effacer les données

Pour arrêter les conteneurs du mode développement :

```powershell
docker compose down
```

Pour arrêter les conteneurs du profil de production :

```powershell
docker compose --profile production down
```

Ces commandes arrêtent et suppriment les conteneurs et le réseau Compose, mais conservent les volumes nommés. Ne pas ajouter `-v` si l'on souhaite garder les données MongoDB et les volumes de dépendances.

Si un ancien conteneur autonome nommé `bookchart-api-prod` existe encore, il peut garder le réseau Compose attaché. Le supprimer une fois avec :

```powershell
docker rm -f bookchart-api-prod
```

Cette commande supprime uniquement ce conteneur, pas les volumes. Après cela, utiliser le service Compose `api-prod` plutôt que `docker run` évite de réutiliser un nom de conteneur déjà occupé. Si la commande indique que ce conteneur n'existe pas, il n'y a rien à nettoyer.
