const express = require("express");
const router  = express.Router();
const { getAll, getUpcoming, create, update, markPaid } = require("../controllers/renewalsController");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/",           getUpcoming);
router.get("/all",        getAll);
router.post("/",          create);
router.put("/:id",        update);
router.patch("/:id/paid", markPaid);

module.exports = router;
