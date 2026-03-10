const { normalCDF, roundTo } = require("../utils/math.utils");

function safeOdds(value) {
  if (!Number.isFinite(value) || value <= 0) return 100;
  return roundTo(value, 2);
}

function calculateMarketValues(input, sourceData = {}) {
  const marketTitle = input.marketTitle || input.title || "";
  const marketId = input.marketId || "";
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

  // Excel logic:
  // Current Mean = source value based on Source Side
  const currentMean =
    sourceSide === "Lay"
      ? sourceLay ?? 0
      : sourceBack ?? 0;

  // Excel logic:
  // Current Std Dev = Initial Std Dev * (Current Mean / Initial Mean)
  // Equivalent to C18 * (C16 / C15) if:
  // C18 = Initial Std Dev
  // C16 = Current Mean
  // C15 = Initial Mean
  const currentStdDev =
    initialMean > 0 ? initialStdDev * (currentMean / initialMean) : 0;

  const normValue =
    currentStdDev > 0 ? normalCDF(runsLine, currentMean, currentStdDev) : 0;

  // Excel formulas:
  // back yes = 1 / ((1 - NORM.DIST(runs, currentMean, currentStdDev, TRUE)) * (1 - margin))
  // back no  = 1 / ((NORM.DIST(runs, currentMean, currentStdDev, TRUE)) * (1 - margin))

  const backYesRaw =
    (1 - normValue) > 0 && (1 - margin) > 0
      ? 1 / ((1 - normValue) * (1 - margin))
      : 100;

  const backNoRaw =
    normValue > 0 && (1 - margin) > 0
      ? 1 / (normValue * (1 - margin))
      : 100;

  // Excel formulas:
  // lay yes = if(back yes <= 2, back yes + rateDiff, 1 / (back no - 1) + 1)
  // lay no  = if(back no  <= 2, back no  + rateDiff, 1 / (back yes - 1) + 1 + rateDiff)

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

  const backYes = safeOdds(backYesRaw);
  const backNo = safeOdds(backNoRaw);
  const layYes = safeOdds(layYesRaw);
  const layNo = safeOdds(layNoRaw);

  return {
    marketTitle,
    marketId,
    source,
    sourceSide,

    sourceBack: sourceBack != null ? roundTo(sourceBack, 2) : null,
    sourceLay: sourceLay != null ? roundTo(sourceLay, 2) : null,

    margin: roundTo(margin, 4),
    marginPercent: roundTo(margin * 100, 2),

    runsLine: roundTo(runsLine, 2),
    initialMean: roundTo(initialMean, 2),
    initialStdDev: roundTo(initialStdDev, 2),
    rateDiff: roundTo(rateDiff, 2),

    currentMean: roundTo(currentMean, 2),
    currentStdDev: roundTo(currentStdDev, 2),

    normValue: roundTo(normValue, 6),

    backYes,
    backNo,
    layYes,
    layNo,

    displayTitle: `${marketTitle} :: ${roundTo(runsLine, 2)} runs`
  };
}

module.exports = {
  calculateMarketValues
};