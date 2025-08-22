/**
 * @openapi
 * /api/movies:
 *   get:
 *     tags: [Movies]
 *     summary: List movies (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Paged list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoviePage' }
 *
 * /api/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Get a movie by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Movie
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Movie' }
 *       404: { description: Not found }
 *   put:
 *     tags: [Movies]
 *     summary: Update a movie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Movie' }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 *   delete:
 *     tags: [Movies]
 *     summary: Delete a movie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *
 * /api/movies:
 *   post:
 *     tags: [Movies]
 *     summary: Create a movie
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Movie' }
 *     responses:
 *       201: { description: Created }
 */
module.exports = {};