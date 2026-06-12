import { prisma } from '@/lib/prisma';
import { validateBKTParams } from '@/utils/bkt';

export interface BKTParams {
  p_init: number;
  p_learn: number;
  p_guess: number;
  p_slip: number;
}

export interface KnowledgeState {
  id?: string;
  siswaId: string;
  modulId: string;
  knowledgeComponentId: string;
  p_init: number;
  p_learn: number;
  p_guess: number;
  p_slip: number;
  p_mastery_current: number;
  last_updated: Date;
}

const defaultParams: BKTParams = {
  p_init: 0.2,
  p_learn: 0.3,
  p_guess: 0.1,
  p_slip: 0.1,
};

/**
 * Helper: Update mastery dengan BKT formula.
 */
export const updateMastery = (
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParams,
): number => {
  if (isCorrect) {
    // P(L|correct) = P(L) * (1 - P(S)) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
    const numerator = currentMastery * (1 - params.p_slip);
    const denominator = numerator + (1 - currentMastery) * params.p_guess;
    return params.p_learn + (1 - params.p_learn) * (numerator / denominator);
  } else {
    // P(L|incorrect) = P(L) * P(S) / (P(L) * P(S) + (1 - P(L)) * (1 - P(G)))
    const numerator = currentMastery * params.p_slip;
    const denominator =
      numerator + (1 - currentMastery) * (1 - params.p_guess);
    return params.p_learn + (1 - params.p_learn) * (numerator / denominator);
  }
};

/**
 * Initialize knowledge state dari pretest answers.
 */
export const initializeKnowledgeStateFromPretest = async (
  siswaId: string,
  modulId: string,
  pretestAnswers: { questionId: string; isCorrect: boolean }[],
): Promise<void> => {
  const knowledgeComponents = await prisma.knowledgeComponent.findMany({
    where: { modulId: modulId },
  });

  if (knowledgeComponents.length === 0) {
    const totalScore = pretestAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = pretestAnswers.length;
    const masteryProxy = totalQuestions > 0 ? totalScore / totalQuestions : 0;
    console.log(`[BKT] No knowledge components mapped, using proxy mastery: ${masteryProxy}`);
    return;
  }

  for (const kc of knowledgeComponents) {
    let mastery = defaultParams.p_init;
    let hasObservations = false;

    const relevantAnswers = await Promise.all(
      pretestAnswers.map(async (answer) => {
        const map = await prisma.pretestQuestionSkillMap.findFirst({
          where: {
            pretestQuestionId: answer.questionId,
            knowledgeComponentId: kc.id,
          },
        });
        return map ? { ...answer, weight: map.weight } : null;
      }),
    ).then((results) => results.filter(Boolean));

    for (const answer of relevantAnswers) {
      if (answer) {
        mastery = updateMastery(
          mastery,
          answer.isCorrect,
          defaultParams,
        );
        hasObservations = true;
      }
    }

    if (hasObservations) {
      if (!validateBKTParams(defaultParams)) {
        throw new Error('BKT parameter values out of valid range [0, 1]');
      }
      await prisma.studentKnowledgeState.upsert({
        where: {
          siswaId_modulId_knowledgeComponentId: {
            siswaId: siswaId,
            modulId: modulId,
            knowledgeComponentId: kc.id,
          },
        },
        update: {
          p_mastery_current: mastery,
        },
        create: {
          siswaId: siswaId,
          modulId: modulId,
          knowledgeComponentId: kc.id,
          p_init: defaultParams.p_init,
          p_learn: defaultParams.p_learn,
          p_guess: defaultParams.p_guess,
          p_slip: defaultParams.p_slip,
          p_mastery_current: mastery,
        },
      });
    }
  }
};

/**
 * Update knowledge state dengan observasi baru (benar/salah).
 */
export const updateKnowledgeStateWithObservation = async (
  siswaId: string,
  modulId: string,
  knowledgeComponentId: string,
  isCorrect: boolean,
): Promise<void> => {
  const state = await prisma.studentKnowledgeState.findUnique({
    where: {
      siswaId_modulId_knowledgeComponentId: {
        siswaId: siswaId,
        modulId: modulId,
        knowledgeComponentId: knowledgeComponentId,
      },
    },
  });

  if (!state) {
    const newMastery = updateMastery(
      defaultParams.p_init,
      isCorrect,
      defaultParams,
    );
    await prisma.studentKnowledgeState.create({
      data: {
        siswaId: siswaId,
        modulId: modulId,
        knowledgeComponentId: knowledgeComponentId,
        p_init: defaultParams.p_init,
        p_learn: defaultParams.p_learn,
        p_guess: defaultParams.p_guess,
        p_slip: defaultParams.p_slip,
        p_mastery_current: newMastery,
      },
    });
    return;
  }

  const newMastery = updateMastery(state.p_mastery_current, isCorrect, {
    p_init: state.p_init,
    p_learn: state.p_learn,
    p_guess: state.p_guess,
    p_slip: state.p_slip,
  });

  await prisma.studentKnowledgeState.update({
    where: { id: state.id },
    data: { p_mastery_current: newMastery },
  });
};

/**
 * Evaluate apakah materi unlocked berdasarkan mastery threshold.
 */
export const evaluateUnlockedContents = async (
  siswaId: string,
  modulId: string,
): Promise<{
  unlockedMateriIds: string[];
  lockedMateris: {
    id: string;
    reason: string;
    requiredMastery: number;
    currentMastery: number;
  }[];
}> => {
  const unlockRules = await prisma.moduleUnlockRule.findMany({
    where: { modulId: modulId },
    include: { knowledgeComponent: true },
  });

  const unlocked: string[] = [];
  const locked: {
    id: string;
    reason: string;
    requiredMastery: number;
    currentMastery: number;
  }[] = [];

  for (const rule of unlockRules) {
    if (rule.targetType !== 'MATERI') continue;

    const state = await prisma.studentKnowledgeState.findUnique({
      where: {
        siswaId_modulId_knowledgeComponentId: {
          siswaId: siswaId,
          modulId: modulId,
          knowledgeComponentId: rule.knowledgeComponentId,
        },
      },
    });

    const currentMastery = state?.p_mastery_current ?? 0;
    if (currentMastery >= rule.materyTreshold) {
      unlocked.push(rule.targetId);
    } else {
      locked.push({
        id: rule.targetId,
        reason: `Mastery untuk ${rule.knowledgeComponent.nama} belum mencapai threshold`,
        requiredMastery: rule.materyTreshold,
        currentMastery,
      });
    }
  }

  return { unlockedMateriIds: unlocked, lockedMateris: locked };
};

/**
 * Sync progress summary berdasarkan completion materi dan mastery.
 */
export const syncModuleProgressSummary = async (
  siswaId: string,
  modulId: string,
): Promise<void> => {
  const progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
  });

  if (!progress) return;

  const averageMastery = await prisma.studentKnowledgeState.aggregate({
    where: { siswaId: siswaId, modulId: modulId },
    _avg: { p_mastery_current: true },
  });

  const finalScore =
    (progress.pretestScore ?? 0) * 0.3 +
    (progress.posttestScore ?? 0) * 0.4 +
    (averageMastery._avg.p_mastery_current ?? 0) * 100 * 0.3;

  const isPassed = finalScore >= 60;

  await prisma.progress.update({
    where: { id: progress.id },
    data: {
      finalScore: finalScore,
      isGraduated: isPassed,
    },
  });
};
