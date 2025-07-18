const express = require("express");
const { categoryAdminController } = require("../../controller");

const router = new express.Router();

/**
 * @swagger
 * /admin/category:
 *   get:
 *     summary: Get all category
 *     tags:
 *        - admin/category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", categoryAdminController.getAllCategory);

/**
 * @swagger
 * /admin/category/create:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - admin/category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request (missing fields or invalid data)
 *       401:
 *         description: Unauthorized
 */
router.post("/create", categoryAdminController.createCategory);

/**
 * @swagger
 * /admin/category/check:
 *   get:
 *     summary: Check if a category with the given name exists
 *     tags:
 *       - admin/category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the category to check
 *     responses:
 *       200:
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid name parameter
 *       401:
 *         description: Unauthorized
 */
router.get("/check", categoryAdminController.checkCategory);

/**
 * @swagger
 * /admin/category/update/{id}:
 *   patch:
 *     summary: Update category name and image
 *     tags:
 *       - admin/category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Category Name
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Category not found
 */
router.patch("/update/:id", categoryAdminController.updateCategory);

module.exports = router;
