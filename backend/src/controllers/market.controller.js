const { fetchSourceMarketData } = require("../services/source-api.service");
const { calculateMarketValues } = require("../services/market.service");

async function getSourceMarket(req, res) {
  try {
    const { marketId } = req.params;

    const sourceData = await fetchSourceMarketData(marketId);

    return res.status(200).json({
      success: true,
      message: "Source market fetched successfully",
      data: sourceData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch market data",
      error: error.message
    });
  }
}

async function calculateMarket(req, res) {
  try {
    const marketId = req.body.marketId;

    const sourceData = await fetchSourceMarketData(marketId);
    const result = calculateMarketValues(req.body, sourceData);

    return res.status(200).json({
      success: true,
      message: "Market calculated successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Calculation failed",
      error: error.message
    });
  }
}

module.exports = {
  getSourceMarket,
  calculateMarket
};