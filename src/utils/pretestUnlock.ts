/**
 * Hitung jumlah submodule (Topik) yang terbuka berdasarkan pretest score.
 * Business rule: MAX(FLOOR(total_submodules * (pretest_score / 100)), 1)
 * - Minimal 1 submodule selalu terbuka.
 * - Hasil selalu integer dan tidak pernah melebihi total_submodules.
 */
export function calculateUnlockedCount(
  totalSubmodules: number,
  pretestScore: number,
): number {
  if (totalSubmodules <= 0) return 1;
  if (pretestScore >= 100) return totalSubmodules;
  if (pretestScore <= 0) return 1;

  const count = Math.floor(totalSubmodules * (pretestScore / 100));
  return Math.max(count, 1);
}
