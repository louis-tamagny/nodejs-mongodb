# Utilisation

Cloner le dépôt git:
```bash
git clone git@github.com:louis-tamagny/nodejs-mongodb.git
cd nodejs-mongodb
```
Installer les packages npm:
```bash
npm install
```

Créer un fichier `.env` à la racine et copier le contenu de `.env.example`:
```bash
cat .env.example > .env
```
Lancer l'application:
```bash
npm run dev
```

L'endpoint swagger est disponible à l'adresse `http://localhost:3000/api-docs`

Pour se connecter à l'API, il faut utiliser les routes /auth/register puis /auth/login.

Les routes suivantes sont protégés par l'authentification:
- POST /potions
- PUT /potions/:id
- DELETE /potions/:id
