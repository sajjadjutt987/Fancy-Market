function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-x * x));

  return sign * y;
}

function normalCDF(x, mean, stdDev) {
  if (stdDev <= 0) {
    return x >= mean ? 1 : 0;
  }

  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTickSize(odds) {
  if (odds < 2) return 0.01;
  if (odds < 3) return 0.02;
  if (odds < 4) return 0.05;
  if (odds < 6) return 0.1;
  if (odds < 10) return 0.2;
  if (odds < 20) return 0.5;
  if (odds < 30) return 1;
  if (odds < 50) return 2;
  return 5;
}

function roundToNearestTick(odds) {
  const safeOdds = clamp(odds, 1.01, 100);
  const tick = getTickSize(safeOdds);
  return Number((Math.round(safeOdds / tick) * tick).toFixed(2));
}

function probabilityToOdds(probability) {
  if (probability <= 0) return 100;
  if (probability >= 1) return 1.01;

  const rawOdds = 1 / probability;
  return clamp(rawOdds, 1.01, 100);
}

function adjustLayPrice(backPrice, rateDiff) {
  let layPrice;

  if (backPrice <= 2) {
    layPrice = backPrice + rateDiff;
  } else {
    const impliedProb = 1 / backPrice;
    const adjustedProb = impliedProb - rateDiff * 0.01;

    if (adjustedProb <= 0) {
      layPrice = backPrice;
    } else {
      layPrice = 1 / adjustedProb;
    }
  }

  return clamp(layPrice, 1.01, 100);
}

function roundTo(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(decimals));
}

module.exports = {
  normalCDF,
  probabilityToOdds,
  adjustLayPrice,
  roundTo,
  clamp,
  getTickSize,
  roundToNearestTick
};