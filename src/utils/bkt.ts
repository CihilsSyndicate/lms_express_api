/**
 * Utility functions for Bayesian Knowledge Tracing (BKT)
 */

export interface BKTParams {
  p_init: number;
  p_learn: number;
  p_guess: number;
  p_slip: number;
}

export const defaultBKTParams: BKTParams = {
  p_init: 0.2,
  p_learn: 0.3,
  p_guess: 0.1,
  p_slip: 0.1,
};

/**
 * Calculate new mastery probability after an observation.
 */
export function updateMasteryProbability(
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParams = defaultBKTParams,
): number {
  if (isCorrect) {
    // Correct response
    const numerator = currentMastery * (1 - params.p_slip);
    const denominator = numerator + (1 - currentMastery) * params.p_guess;
    const p_correct_given_mastery = numerator / denominator;
    return params.p_learn + (1 - params.p_learn) * p_correct_given_mastery;
  } else {
    // Incorrect response
    const numerator = currentMastery * params.p_slip;
    const denominator = numerator + (1 - currentMastery) * (1 - params.p_guess);
    const p_incorrect_given_mastery = numerator / denominator;
    return params.p_learn + (1 - params.p_learn) * p_incorrect_given_mastery;
  }
}

/**
 * Validate BKT parameters.
 */
export function validateBKTParams(params: BKTParams): boolean {
  return (
    params.p_init >= 0 &&
    params.p_init <= 1 &&
    params.p_learn >= 0 &&
    params.p_learn <= 1 &&
    params.p_guess >= 0 &&
    params.p_guess <= 1 &&
    params.p_slip >= 0 &&
    params.p_slip <= 1
  );
}

/**
 * Calculate average mastery across multiple knowledge components.
 */
export function calculateAverageMastery(masteries: number[]): number {
  if (masteries.length === 0) return 0;
  return masteries.reduce((sum, m) => sum + m, 0) / masteries.length;
}
