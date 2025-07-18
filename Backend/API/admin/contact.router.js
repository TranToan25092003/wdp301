const express = require("express");
const { contactController } = require("../../controller");
const contactValidation = require("../../dto/contact.dto");
const {
  throwErrors,
} = require("../../middleware/validate-data/throwErrors.middleware");
const { authenticate } = require("../../middleware/guards/authen.middleware");
const { roleProtected } = require("../../middleware/guards/role.middleware");

const router = new express.Router();

/**
 * @swagger
 * /admin/contact:
 *   get:
 *     summary: Get all contact information
 *     tags:
 *        - admin/contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", contactController.getContact);

/**
 * @swagger
 * /admin/contact:
 *   patch:
 *     summary: update contact info
 *     tags:
 *        - admin/contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: "hanoi"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               email:
 *                  type: string
 *                  example: "abc@gmail.com"
 *               facebook:
 *                  type: string
 *                  example: "facebook://abc/123"
 *               zalo:
 *                  type: string
 *                  example: "zalo/oke/siu"
 *               iframe:
 *                  type: string
 *                  example: "<iframe>abcd</iframe>"
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  "/",
  authenticate,
  roleProtected,
  contactValidation,
  throwErrors,
  contactController.updateContact
);

module.exports = router;
