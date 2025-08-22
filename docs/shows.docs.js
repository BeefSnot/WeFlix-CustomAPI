/**
 * @openapi
 * /api/shows:
 *   get:
 *     tags: [Shows]
 *     summary: List shows/files from SHOWS_DIR
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Filter by name (contains)
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 200, default: 50 }
 *     responses:
 *       200:
 *         description: Directory listing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ShowList' }
 */
module.exports = {};