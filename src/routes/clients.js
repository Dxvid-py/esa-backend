const express = require("express");
const router  = express.Router();
const { getAll, getOne, create, update, remove } = require("../controllers/clientsController");
const auth = require("../middlewares/auth");

router.use(auth); // Todas las rutas protegidas

router.get("/",    getAll);
router.get("/:id", getOne);
router.post("/",   create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
