const axios = require("axios");

async function fetchMarketDetailsByMarketId(marketId) {
  try {
    const baseUrl = process.env.PLAYFAIR_BASE_URL;

    if (!baseUrl || !marketId) {
      return {
        success: false,
        data: null,
        error: "PLAYFAIR_BASE_URL or marketId is missing"
      };
    }

    const url = `${baseUrl}/markets`;

    const response = await axios.get(url, {
      params: {
        paginate: false,
        status: "OPEN",
        market_id: marketId
      },
      timeout: 5000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

module.exports = {
  fetchMarketDetailsByMarketId
};