// routes/auth.js
const express = require("express");
const router = express.Router();
const { login, register, me } = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.post("/login",    login);
router.post("/register", register);
router.get("/me",        auth, me);

module.exports = router;
