const express = require("express");
const router = express.Router();
const Potion = require("../models/potion.model");
const authMiddleware = require("../authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Potions
 *     description: Gestion des potions
 */

/**
 * @swagger
 * /potions/names:
 *   get:
 *     summary: Récupérer les noms des potions
 *     tags:
 *       - Potions
 *     responses:
 *       200:
 *         description: Liste des noms des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/names", async (req, res) => {
  try {
    const names = await Potion.find({}, "name"); // On ne sélectionne que le champ 'name'
    res.json(names.map((p) => p.name)); // renvoyer juste un tableau de strings
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupérer les potions d'un vendeur
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: vendor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du vendeur
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/potion'
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/vendor/:vendor_id", async (req, res) => {
  try {
    const potions = await Potion.find({ vendor_id: req.params.vendor_id });
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupérer les potions dans un intervalle de prix
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: true
 *         description: Prix minimum
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: true
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Liste des potions dans le prix
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/potion'
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/price-range", async (req, res) => {
  try {
    const potions = await Potion.where("price")
      .gte(parseInt(req.query.min))
      .lte(parseInt(req.query.max));
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupérer toutes les potions
 *     tags:
 *       - Potions
 *     responses:
 *       200:
 *         description: Liste des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/potion'
 */
router.get("/", async (req, res) => {
  try {
    const potions = await Potion.find();
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Créer une potion
 *     tags:
 *       - Potions
 *     security:
 *       - jwtCookie: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/potion'
 *     responses:
 *       201:
 *         description: Potion créée
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
router.post("/", authMiddleware, async (req, res) => {
  try {
    const potionParams = req.body;
    const createdPotion = await Potion.insertOne(potionParams);
    res.status(201).json(createdPotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupérer une potion
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la potion
 *     responses:
 *       200:
 *         description: Potion trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/potion'
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", async (req, res) => {
  try {
    const potion = await Potion.findById(req.params.id);
    res.json(potion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   put:
 *     summary: Modifier une potion
 *     tags:
 *       - Potions
 *     security:
 *       - jwtCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la potion
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/potion'
 *     responses:
 *       201:
 *         description: Potion modifiée
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
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const potionParams = req.body;
    await Potion.findByIdAndUpdate(req.params.id, potionParams, {
      runValidators: true,
    });
    res.status(201).json({_id: req.params.id, ...potionParams});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprimer une potion
 *     tags:
 *       - Potions
 *     security:
 *       - jwtCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la potion
 *     responses:
 *       204:
 *         description: Potion supprimée
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Potion.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
