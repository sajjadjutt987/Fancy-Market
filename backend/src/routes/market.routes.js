const express = require("express");
const router = express.Router();

const {
  getSourceMarket,
  calculateMarket
} = require("../controllers/market.controller");

router.get("/source/:marketId", getSourceMarket);
router.post("/calculate", calculateMarket);

module.exports = router;