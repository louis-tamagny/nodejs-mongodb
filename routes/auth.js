const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const COOKIE_NAME = process.env.COOKIE_NAME || "demo_node+mongo_token";
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwtCookie:
 *       type: apiKey
 *       in: cookie
 *       name: demo_node+mongo_token
 */

// POST /auth/register  toujours passer les inputs user au sanitize()
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un utilisateur
 *     tags:
 *       - Authentication
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post(
  "/register",
  [
    body("name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Le nom d’utilisateur est requis.")
      .isLength({ min: 3, max: 30 })
      .withMessage("Doit faire entre 3 et 30 caractères."),
    body("password")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Le mot de passe est requis.")
      .isLength({ min: 6 })
      .withMessage("Minimum 6 caractères."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, password } = req.body;

    try {
      const user = new User({ name, password });
      await user.save();
      res.status(201).json({ message: "Utilisateur créé" });
    } catch (err) {
      if (err.code === 11000)
        return res.status(500).json({ error: "Erreur système" });
      res.status(400).json({ error: err.message });
    }
  }
);

// POST /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Se connecter
 *     tags:
 *       - Authentication
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: false, // à mettre sur true en prod (https)
    maxAge: 24 * 60 * 60 * 1000, // durée de vie 24h
  });

  res.json({ message: "Connecté avec succès" });
});

// GET /auth/logout
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Se déconnecter
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Déconnecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Déconnecté" });
});

module.exports = router;
