import { describe, it, expect } from 'vitest';
import { updateMasteryProbability, defaultBKTParams } from '@/utils/bkt';

describe('BKT Mathematical Model (src/utils/bkt.ts)', () => {
  const params = defaultBKTParams; // p_init: 0.2, p_learn: 0.3, p_guess: 0.1, p_slip: 0.1

  it('should increase mastery after a correct answer', () => {
    const initialMastery = 0.5;
    const nextMastery = updateMasteryProbability(initialMastery, true, params);
    expect(nextMastery).toBeGreaterThan(initialMastery);
  });

  it('should decrease mastery after an incorrect answer', () => {
    const initialMastery = 0.5;
    const nextMastery = updateMasteryProbability(initialMastery, false, params);
    expect(nextMastery).toBeLessThan(initialMastery);
  });

  it('should converge towards 1.0 with repeated correct answers', () => {
    let mastery = 0.1;
    for (let i = 0; i < 10; i++) {
      mastery = updateMasteryProbability(mastery, true, params);
    }
    expect(mastery).toBeCloseTo(1.0, 1);
    expect(mastery).toBeLessThanOrEqual(1.0);
  });

  it('should converge towards a stable floor with repeated incorrect answers', () => {
    // In BKT, mastery won't go to 0 because there's always a chance to learn (p_learn).
    // It converges to a point where learning gain equals observation loss.
    let mastery = 0.9;
    for (let i = 0; i < 50; i++) {
      mastery = updateMasteryProbability(mastery, false, params);
    }
    expect(mastery).toBeGreaterThanOrEqual(params.p_learn);
    // For default params (0.3, 0.1, 0.1), it converges to ~0.3375
    expect(mastery).toBeCloseTo(0.3375, 3);
  });

  it('should handle high guess probability (correct answer is less indicative of mastery)', () => {
    const highGuessParams = { ...params, p_guess: 0.4 };
    const m1 = updateMasteryProbability(0.5, true, params);
    const m2 = updateMasteryProbability(0.5, true, highGuessParams);
    expect(m2).toBeLessThan(m1);
  });

  it('should handle high slip probability (incorrect answer is less indicative of non-mastery)', () => {
    const highSlipParams = { ...params, p_slip: 0.4 };
    const m1 = updateMasteryProbability(0.5, false, params);
    const m2 = updateMasteryProbability(0.5, false, highSlipParams);
    expect(m2).toBeGreaterThan(m1);
  });

  it('should handle boundary probabilities (approaching 0.0)', () => {
    const nextMastery = updateMasteryProbability(0.0001, false, params);
    expect(nextMastery).toBeGreaterThanOrEqual(0);
    expect(nextMastery).toBeLessThan(1);
  });

  it('should handle boundary probabilities (approaching 1.0)', () => {
    const nextMastery = updateMasteryProbability(0.9999, true, params);
    expect(nextMastery).toBeGreaterThan(0);
    expect(nextMastery).toBeLessThanOrEqual(1.0);
  });

  it('should be deterministic', () => {
    const m1 = updateMasteryProbability(0.5, true, params);
    const m2 = updateMasteryProbability(0.5, true, params);
    expect(m1).toBe(m2);
  });
});
