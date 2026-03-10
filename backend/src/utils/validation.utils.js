function validateMarketInput(input) {
  const errors = [];

  const marketTitle = String(input.marketTitle || "").trim();
  const marketId = String(input.marketId || "").trim();
  const sourceSide = String(input.sourceSide || "").trim();

  const margin = Number(input.margin);
  const runsLine = Number(input.runsLine);
  const initialMean = Number(input.initialMean);
  const initialStdDev = Number(input.initialStdDev);
  const rateDiff = Number(input.rateDiff);
  const totalOvers = Number(input.totalOvers);
  const oversCompleted = Number(input.oversCompleted);
  const runsScored = Number(input.runsScored);
  const wicketsLost = Number(input.wicketsLost);

  if (!marketTitle) {
    errors.push("Market Title is required");
  }

  if (!marketId) {
    errors.push("Market ID is required");
  }

  if (!["Back", "Lay"].includes(sourceSide)) {
    errors.push("Source Side must be Back or Lay");
  }

  if (!Number.isFinite(margin) || margin < 0 || margin >= 1) {
    errors.push("Margin must be a number between 0 and less than 1");
  }

  if (!Number.isFinite(runsLine) || runsLine < 0) {
    errors.push("Runs Line must be a valid non negative number");
  }

  if (!Number.isFinite(initialMean) || initialMean < 0) {
    errors.push("Initial Mean must be a valid non negative number");
  }

  if (!Number.isFinite(initialStdDev) || initialStdDev <= 0) {
    errors.push("Initial Std Dev must be greater than 0");
  }

  if (!Number.isFinite(rateDiff) || rateDiff < 0) {
    errors.push("Rate Diff must be a valid non negative number");
  }

  if (!Number.isFinite(totalOvers) || totalOvers <= 0) {
    errors.push("Total Overs must be greater than 0");
  }

  if (!Number.isFinite(oversCompleted) || oversCompleted < 0) {
    errors.push("Overs Completed must be a valid non negative number");
  }

  if (oversCompleted > totalOvers) {
    errors.push("Overs Completed cannot be greater than Total Overs");
  }

  if (!Number.isFinite(runsScored) || runsScored < 0) {
    errors.push("Runs Scored must be a valid non negative number");
  }

  if (!Number.isFinite(wicketsLost) || wicketsLost < 0 || wicketsLost > 10) {
    errors.push("Wickets Lost must be between 0 and 10");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateMarketInput
};