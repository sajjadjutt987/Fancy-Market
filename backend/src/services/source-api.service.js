const axios = require("axios");

async function fetchFancySessionsByEventId(eventId) {
  const baseUrl = process.env.PLAYFAIR_BASE_URL;

  const response = await axios.get(`${baseUrl}/sessions`, {
    params: {
      eventId,
      status: true
    },
    timeout: 8000
  });

  const rows = Array.isArray(response.data?.data) ? response.data.data : [];

  return rows.map((item, index) => ({
    id: item._id || `${item.marketId || "row"}-${index}`,
    eventId: item.eventId ?? null,
    marketId: item.marketId ?? null,
    selectionId: item.SelectionId ?? null,
    runnerName: item.RunnerName ?? "",
    sourceBack: item.BackPrice1 ?? null,
    sourceLay: item.LayPrice1 ?? null,
    gameStatus: item.GameStatus ?? "",
    min: item.min ?? null,
    max: item.max ?? null
  }));
}

function findFancyByMarketId(rows, marketId) {
  if (!Array.isArray(rows)) return null;
  return rows.find((row) => String(row.marketId) === String(marketId)) || null;
}

module.exports = {
  fetchFancySessionsByEventId,
  findFancyByMarketId
};