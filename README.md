# Utilisation
Lancer l'application avec `npm run dev`

L'endpoint swagger est disponible à l'adresse `http://localhost:3000/api-docs`

Pour se connecter à l'API, il faut utiliser les routes /auth/register puis /auth/login.

Les routes suivantes sont protégés par l'authentification:
- POST /potions
- PUT /potions/:id
- DELETE /potions/:id
