const axios = require("axios");

async function fetchMarketDetailsByMarketId(marketId) {
  const baseUrl = process.env.PLAYFAIR_BASE_URL;

  const response = await axios.get(`${baseUrl}/markets`, {
    params: {
      paginate: false,
      status: "OPEN",
      market_id: marketId
    },
    timeout: 8000
  });

  return response.data;
}

async function fetchRatesByMarketId(marketId) {
  const baseUrl = process.env.PLAYFAIR_BASE_URL;

  const response = await axios.get(`${baseUrl}/markets/${marketId}/rates`, {
    params: {
      type: "market"
    },
    timeout: 8000
  });

  return response.data;
}

async function fetchSourceMarketData(marketId) {
  const [marketResponse, ratesResponse] = await Promise.all([
    fetchMarketDetailsByMarketId(marketId),
    fetchRatesByMarketId(marketId)
  ]);

  const marketItem =
    Array.isArray(marketResponse?.data) && marketResponse.data.length > 0
      ? marketResponse.data[0]
      : null;

  const eventRunners = Array.isArray(marketItem?.event_runners)
    ? marketItem.event_runners
    : [];

  const rateRunners = Array.isArray(ratesResponse?.data?.runners)
    ? ratesResponse.data.runners
    : [];

  let selectedRunner = null;

  if (eventRunners.length > 0) {
    const firstEventRunner = eventRunners[0];

    const matchedRateRunner = rateRunners.find(
      (item) => String(item.selectionId) === String(firstEventRunner.selectionId)
    );

    selectedRunner = {
      selectionId: firstEventRunner.selectionId,
      runnerName: firstEventRunner.runnerName || null,
      sourceBack:
        Array.isArray(matchedRateRunner?.back) && matchedRateRunner.back.length > 0
          ? matchedRateRunner.back[0]?.price ?? null
          : null,
      sourceLay:
        Array.isArray(matchedRateRunner?.lay) && matchedRateRunner.lay.length > 0
          ? matchedRateRunner.lay[0]?.price ?? null
          : null
    };
  } else if (rateRunners.length > 0) {
    const firstRateRunner = rateRunners[0];

    selectedRunner = {
      selectionId: firstRateRunner.selectionId,
      runnerName: null,
      sourceBack:
        Array.isArray(firstRateRunner.back) && firstRateRunner.back.length > 0
          ? firstRateRunner.back[0]?.price ?? null
          : null,
      sourceLay:
        Array.isArray(firstRateRunner.lay) && firstRateRunner.lay.length > 0
          ? firstRateRunner.lay[0]?.price ?? null
          : null
    };
  }

  return {
    sourceMarketId: marketItem?.market_id || ratesResponse?.data?.marketId || marketId,
    marketName: marketItem?.name || null,
    selectionId: selectedRunner?.selectionId || null,
    runnerName: selectedRunner?.runnerName || null,
    sourceBack: selectedRunner?.sourceBack ?? null,
    sourceLay: selectedRunner?.sourceLay ?? null
  };
}

module.exports = {
  fetchSourceMarketData
};