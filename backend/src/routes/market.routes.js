const express = require("express");
const router = express.Router();

const {
  getFancyList,
  calculateMarket
} = require("../controllers/market.controller");

router.get("/fancies/:eventId", getFancyList);
router.post("/calculate", calculateMarket);

module.exports = router;