const {
  fetchFancySessionsByEventId,
  findFancyByMarketId
} = require("../services/source-api.service");
const { calculateMarketValues } = require("../services/market.service");

async function getFancyList(req, res) {
  try {
    const { eventId } = req.params;

    const rows = await fetchFancySessionsByEventId(eventId);

    return res.status(200).json({
      success: true,
      message: "Fancy list fetched successfully",
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch fancy list",
      error: error.message
    });
  }
}

async function calculateMarket(req, res) {
  try {
    const {
      eventId,
      marketId,
      sourceData
    } = req.body;

    let finalSourceData = sourceData || null;

    if ((!finalSourceData || finalSourceData.sourceBack == null) && eventId) {
      const rows = await fetchFancySessionsByEventId(eventId);

      if (marketId) {
        finalSourceData = findFancyByMarketId(rows, marketId);
      }

      if (!finalSourceData && Array.isArray(rows) && rows.length > 0) {
        finalSourceData = rows[0];
      }
    }

    if (!finalSourceData) {
      return res.status(400).json({
        success: false,
        message: "Source data not found for calculation"
      });
    }

    const result = calculateMarketValues(req.body, finalSourceData);

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
  getFancyList,
  calculateMarket
};