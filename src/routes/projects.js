// routes/projects.js
const express = require("express");
const router  = express.Router();
const { getAll, getOne, getByClient, create, update, remove } = require("../controllers/projectsController");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/",                    getAll);
router.get("/client/:clientId",    getByClient);
router.get("/:id",                 getOne);
router.post("/",                   create);
router.put("/:id",                 update);
router.delete("/:id",              remove);

module.exports = router;
