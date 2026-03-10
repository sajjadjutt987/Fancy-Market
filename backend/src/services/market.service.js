const { normalCDF, roundTo } = require("../utils/math.utils");

function safeOdds(value) {
  if (!Number.isFinite(value) || value <= 0) return 100;
  return roundTo(value, 2);
}

function calculateMarketValues(input, sourceData = {}) {
  const marketTitle = input.marketTitle || input.title || sourceData.runnerName || "";
  const marketId = input.marketId || sourceData.marketId || "";
  const eventId = input.eventId || sourceData.eventId || "";
  const source = input.source || "";
  const sourceSide = input.sourceSide || "Back";

  const margin = Number(input.margin) || 0;
  const runsLine = Number(input.runsLine ?? input.runs) || 0;
  const initialMean = Number(input.initialMean) || 0;
  const initialStdDev = Number(input.initialStdDev) || 0;
  const rateDiff = Number(input.rateDiff) || 0;

  const sourceBack =
    sourceData && sourceData.sourceBack != null
      ? Number(sourceData.sourceBack)
      : null;

  const sourceLay =
    sourceData && sourceData.sourceLay != null
      ? Number(sourceData.sourceLay)
      : null;

  const currentMean =
    sourceSide === "Lay"
      ? (sourceLay ?? initialMean)
      : (sourceBack ?? initialMean);

  const currentStdDev =
    initialMean > 0 ? initialStdDev * (currentMean / initialMean) : 0;

  const normValue =
    currentStdDev > 0 ? normalCDF(runsLine, currentMean, currentStdDev) : 0;

  const backYesRaw =
    (1 - normValue) > 0 && (1 - margin) > 0
      ? 1 / ((1 - normValue) * (1 - margin))
      : 100;

  const backNoRaw =
    normValue > 0 && (1 - margin) > 0
      ? 1 / (normValue * (1 - margin))
      : 100;

  const layYesRaw =
    backYesRaw <= 2
      ? backYesRaw + rateDiff
      : backNoRaw > 1
      ? 1 / (backNoRaw - 1) + 1
      : 100;

  const layNoRaw =
    backNoRaw <= 2
      ? backNoRaw + rateDiff
      : backYesRaw > 1
      ? 1 / (backYesRaw - 1) + 1 + rateDiff
      : 100;

  return {
    eventId,
    marketId,
    selectionId: sourceData.selectionId || null,
    marketTitle,
    runnerName: sourceData.runnerName || marketTitle,
    source,
    sourceSide,
    sourceBack: sourceBack != null ? roundTo(sourceBack, 2) : null,
    sourceLay: sourceLay != null ? roundTo(sourceLay, 2) : null,
    gameStatus: sourceData.gameStatus || "",
    min: sourceData.min ?? null,
    max: sourceData.max ?? null,
    margin: roundTo(margin, 4),
    marginPercent: roundTo(margin * 100, 2),
    runsLine: roundTo(runsLine, 2),
    initialMean: roundTo(initialMean, 2),
    initialStdDev: roundTo(initialStdDev, 2),
    rateDiff: roundTo(rateDiff, 2),
    currentMean: roundTo(currentMean, 2),
    currentStdDev: roundTo(currentStdDev, 2),
    normValue: roundTo(normValue, 6),
    backYes: safeOdds(backYesRaw),
    backNo: safeOdds(backNoRaw),
    layYes: safeOdds(layYesRaw),
    layNo: safeOdds(layNoRaw),
    displayTitle: `${marketTitle} :: ${roundTo(runsLine, 2)} runs`
  };
}

module.exports = {
  calculateMarketValues
};