import {
  ComparisonDimension,
  ComparisonDimensionScores,
  ComparisonWeightingConfig,
} from './types';

export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  'speed',
  'efficiency',
  'complexityInverse',
  'downsideInverse',
  'upside',
];

export const DEFAULT_COMPARISON_WEIGHTING: ComparisonWeightingConfig = {
  speed: 0.25,
  efficiency: 0.2,
  complexityInverse: 0.15,
  downsideInverse: 0.15,
  upside: 0.25,
};

const DEFAULT_DECIMALS = 4;

export const normalizeWeighting = (
  weighting: ComparisonWeightingConfig,
  decimals = DEFAULT_DECIMALS,
): ComparisonWeightingConfig => {
  const total = COMPARISON_DIMENSIONS.reduce(
    (accumulator, dimension) => accumulator + weighting[dimension],
    0,
  );

  if (total === 0) {
    return { ...DEFAULT_COMPARISON_WEIGHTING };
  }

  return {
    speed: Number((weighting.speed / total).toFixed(decimals)),
    efficiency: Number((weighting.efficiency / total).toFixed(decimals)),
    complexityInverse: Number((weighting.complexityInverse / total).toFixed(decimals)),
    downsideInverse: Number((weighting.downsideInverse / total).toFixed(decimals)),
    upside: Number((weighting.upside / total).toFixed(decimals)),
  };
};

export const calculateWeightedScore = (
  scores: ComparisonDimensionScores,
  weighting: ComparisonWeightingConfig = DEFAULT_COMPARISON_WEIGHTING,
  decimals = DEFAULT_DECIMALS,
): number => {
  const normalizedWeighting = normalizeWeighting(weighting, decimals);

  const weightedSum = COMPARISON_DIMENSIONS.reduce((total, dimension) => {
    const dimensionScore = Math.max(0, Math.min(5, scores[dimension]));
    return total + dimensionScore * normalizedWeighting[dimension];
  }, 0);

  return Number(weightedSum.toFixed(decimals));
};
