const express = require("express");
const router  = express.Router();
const { getAll, getPending, create, update } = require("../controllers/paymentsController");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/",         getAll);
router.get("/pending",  getPending);
router.post("/",        create);
router.put("/:id",      update);

module.exports = router;
