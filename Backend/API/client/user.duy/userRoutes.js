const express = require("express");
const router = express.Router();
const { getUsersWithPosts } = require("../../../controller/user.duy/userController");

router.get("/with-posts", getUsersWithPosts); // GET /api/users/with-posts

module.exports = router;
