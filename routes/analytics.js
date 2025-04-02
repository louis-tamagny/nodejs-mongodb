const express = require("express");
const router = express.Router();
const Potion = require("../models/potion.model");

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Gestion des statistiques
 */

// GET /analytics/distinct-categories aggregat du nombre total de catégories différentes
/**
 * @swagger
 * /analytics/distinct-categories:
 *   get:
 *     summary: Récupérer le nombre de catégories différentes
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Nombre de catégories différentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distinctCategoryCount:
 *                   type: number
 */
router.get("/distinct-categories", async (req, res) => {
  try {
    const categoryCount = await Potion.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories" } },
      { $count: "distinctCategoryCount" },
    ]);

    res.json(categoryCount[0] || { distinctCategoryCount: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/average-score-by-vendor aggregat du score moyen des vendeurs
/**
 * @swagger
 * /analytics/average-score-by-vendor:
 *   get:
 *     summary: Récupérer le score moyen par vendeur
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Score moyen par vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 average:
 *                   type: number
 */
router.get("/average-score-by-vendor", async (req, res) => {
  try {
    const vendorAverages = await Potion.aggregate([
      { $project: { _id: false, score: true, vendor_id: true } },
      { $group: { _id: "$vendor_id", average: { $avg: "$score" } } },
    ]);

    res.json(vendorAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/average-score-by-category aggregat du score moyen des categories
/**
 * @swagger
 * /analytics/average-score-by-category:
 *   get:
 *     summary: Récupérer le score moyen par catégorie
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Score moyen par catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 average:
 *                   type: number
 */
router.get("/average-score-by-category", async (req, res) => {
  try {
    const categoriesAverages = await Potion.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", average: { $avg: "$score" } } },
    ]);
    res.json(categoriesAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/strength-flavor-ratio ratio entre force et parfum des potions
/**
 * @swagger
 * /analytics/strength-flavor-ratio:
 *   get:
 *     summary: Récupérer le ratio entre force et parfum pour chaque potion
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Ratio entre force et parfum pour chaque potion
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   ratio:
 *                     type: number
 */
router.get("/strength-flavor-ratio", async (req, res) => {
  try {
    const ratios = await Potion.aggregate([
      { $match: { "ratings.flavor": { $exists: true, $gt: 0 } } },
      {
        $project: {
          _id: false,
          name: true,
          ratio: { $divide: ["$ratings.strength", "$ratings.flavor"] },
        },
      },
    ]);
    res.json(ratios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/search fonction de recherche avec 3 paramètres :
// grouper par vendeur ou catégorie, metrique au choix (avg, sum, count), champ au choix (score, price, ratings).
/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Récupérer des statistiques sur les potions
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: groupType
 *         schema:
 *           type: string
 *           enum:
 *             - vendor_id
 *             - categories
 *         required: true
 *         description: Type de groupement
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum:
 *             - avg
 *             - sum
 *             - count
 *         required: true
 *         description: Métrique
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *           enum:
 *             - score
 *             - price
 *             - ratings.strength
 *             - ratings.flavor
 *         required: true
 *         description: Champ
 *     responses:
 *       200:
 *         description: Statistiques sur les potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/search", async (req, res) => {
  const { groupType = "vendor_id", metric = "avg", field = "score" } = req.query;

  try {
    const unwindFilter =
      groupType == "categories" ? { $unwind: "$categories" } : null;
    const projectFilter = { $project: { _id: false } };
    projectFilter["$project"][`${groupType}`] = true;
    projectFilter["$project"][`${field}`] = true;
    const groupFilter = { $group: { _id: `$${groupType}` } };
    groupFilter["$group"][`${field.replace(".", "_")}_${metric}`] = {};
    groupFilter["$group"][`${field.replace(".", "_")}_${metric}`][
      `$${metric}`
    ] = metric !== "count" ? `$${field}` : {};

    const pipeline = [];
    if (unwindFilter) {
      pipeline.push(unwindFilter);
    }
    pipeline.push(projectFilter, groupFilter);

    const potions = await Potion.aggregate(pipeline);
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
