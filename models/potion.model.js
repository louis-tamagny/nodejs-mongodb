const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   potion:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       price:
 *         type: number
 *       score:
 *         type: number
 *       ingredients:
 *         type: array
 *       ratings:
 *         type: object
 *         properties:
 *           strength:
 *             type: number
 *           flavor:
 *             type: number
 *       tryDate:
 *         type: string
 *         format: date
 *       categories:
 *         type: array
 *         items:
 *           type: string
 *       vendor_id:
 *         type: string
 *     example:
 *       name: Invisibility
 *       vendor_id: Kettlecooked
 *       price: 25.5
 *       score: 50
 *       ingredients:
 *         - newt toes
 *         - dragon scale powder
 *         - spicy chili essence
 *       categories:
 *         - effective
 *         - premium
 *       ratings:
 *         strength: 2
 *         flavor: 5
 *       tryDate: 2025-04-01T00:00:00.000Z
 */
const potionSchema = new mongoose.Schema({
  name: String,
  price: Number,
  score: Number,
  ingredients: [mongoose.Schema.Types.Mixed],
  ratings: { strength: Number, flavor: Number },
  tryDate: Date,
  categories: [String],
  vendor_id: String
});

module.exports = mongoose.model('potion', potionSchema);
