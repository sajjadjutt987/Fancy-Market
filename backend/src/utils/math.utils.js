function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX));

  return sign * y;
}

function normalCDF(x, mean, stdDev) {
  if (!Number.isFinite(stdDev) || stdDev <= 0) return 0;
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

function roundTo(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(decimals));
}

module.exports = {
  normalCDF,
  roundTo
};