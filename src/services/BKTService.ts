import { prisma } from '../lib/prisma';

export interface BKTParams {
  p_init: number;
  p_learn: number;
  p_guess: number;
  p_slip: number;
}

export interface KnowledgeState {
  id?: string;
  siswa_id: string;
  modul_id: string;
  knowledge_component_id: string;
  p_init: number;
  p_learn: number;
  p_guess: number;
  p_slip: number;
  p_mastery_current: number;
  last_updated: Date;
}

export class BKTService {
  private defaultParams: BKTParams = {
    p_init: 0.2,
    p_learn: 0.3,
    p_guess: 0.1,
    p_slip: 0.1,
  };

  /**
   * Initialize knowledge state dari pretest answers.
   * Jika ada mapping skill, hitung per skill. Jika tidak, gunakan skor total sebagai proxy.
   */
  async initializeKnowledgeStateFromPretest(
    siswaId: string,
    modulId: string,
    pretestAnswers: { questionId: string; isCorrect: boolean }[],
  ): Promise<void> {
    const knowledgeComponents = await prisma.knowledgeComponent.findMany({
      where: { modul_id: modulId },
    });

    if (knowledgeComponents.length === 0) {
      // Fallback: gunakan skor pretest total
      const totalScore = pretestAnswers.filter((a) => a.isCorrect).length;
      const totalQuestions = pretestAnswers.length;
      const masteryProxy = totalQuestions > 0 ? totalScore / totalQuestions : 0;

      // Simpan sebagai state dummy atau skip
      console.log(
        `[BKT] No knowledge components mapped, using proxy mastery: ${masteryProxy}`,
      );
      return;
    }

    for (const kc of knowledgeComponents) {
      let mastery = this.defaultParams.p_init;
      let hasObservations = false;

      // Cari answers yang map ke skill ini
      const relevantAnswers = await Promise.all(
        pretestAnswers.map(async (answer) => {
          const map = await prisma.pretestQuestionSkillMap.findFirst({
            where: {
              soal_pretest_id: answer.questionId,
              knowledge_component_id: kc.id,
            },
          });
          return map ? { ...answer, weight: map.weight } : null;
        }),
      ).then((results) => results.filter(Boolean));

      for (const answer of relevantAnswers) {
        if (answer) {
          mastery = this.updateMastery(
            mastery,
            answer.isCorrect,
            this.defaultParams,
          );
          hasObservations = true;
        }
      }

      if (hasObservations) {
        await prisma.studentKnowledgeState.upsert({
          where: {
            siswa_id_modul_id_knowledge_component_id: {
              siswa_id: siswaId,
              modul_id: modulId,
              knowledge_component_id: kc.id,
            },
          },
          update: {
            p_mastery_current: mastery,
          },
          create: {
            siswa_id: siswaId,
            modul_id: modulId,
            knowledge_component_id: kc.id,
            p_init: this.defaultParams.p_init,
            p_learn: this.defaultParams.p_learn,
            p_guess: this.defaultParams.p_guess,
            p_slip: this.defaultParams.p_slip,
            p_mastery_current: mastery,
          },
        });
      }
    }
  }

  /**
   * Update knowledge state dengan observasi baru (benar/salah).
   */
  async updateKnowledgeStateWithObservation(
    siswaId: string,
    modulId: string,
    knowledgeComponentId: string,
    isCorrect: boolean,
  ): Promise<void> {
    const state = await prisma.studentKnowledgeState.findUnique({
      where: {
        siswa_id_modul_id_knowledge_component_id: {
          siswa_id: siswaId,
          modul_id: modulId,
          knowledge_component_id: knowledgeComponentId,
        },
      },
    });

    if (!state) {
      // Initialize jika belum ada
      const newMastery = this.updateMastery(
        this.defaultParams.p_init,
        isCorrect,
        this.defaultParams,
      );
      await prisma.studentKnowledgeState.create({
        data: {
          siswa_id: siswaId,
          modul_id: modulId,
          knowledge_component_id: knowledgeComponentId,
          p_init: this.defaultParams.p_init,
          p_learn: this.defaultParams.p_learn,
          p_guess: this.defaultParams.p_guess,
          p_slip: this.defaultParams.p_slip,
          p_mastery_current: newMastery,
        },
      });
      return;
    }

    const newMastery = this.updateMastery(state.p_mastery_current, isCorrect, {
      p_init: state.p_init,
      p_learn: state.p_learn,
      p_guess: state.p_guess,
      p_slip: state.p_slip,
    });

    await prisma.studentKnowledgeState.update({
      where: { id: state.id },
      data: { p_mastery_current: newMastery },
    });
  }

  /**
   * Evaluate apakah submateri unlocked berdasarkan mastery threshold.
   */
  async evaluateUnlockedContents(
    siswaId: string,
    modulId: string,
  ): Promise<{
    unlockedSubmateris: string[];
    lockedSubmateris: {
      id: string;
      reason: string;
      requiredMastery: number;
      currentMastery: number;
    }[];
  }> {
    const unlockRules = await prisma.moduleUnlockRule.findMany({
      where: { modul_id: modulId },
    });

    const unlocked: string[] = [];
    const locked: {
      id: string;
      reason: string;
      requiredMastery: number;
      currentMastery: number;
    }[] = [];

    for (const rule of unlockRules) {
      if (rule.target_type !== 'SUBMATERI') continue;

      const state = await prisma.studentKnowledgeState.findUnique({
        where: {
          siswa_id_modul_id_knowledge_component_id: {
            siswa_id: siswaId,
            modul_id: modulId,
            knowledge_component_id: rule.knowledge_component_id,
          },
        },
      });

      const currentMastery = state?.p_mastery_current ?? 0;
      if (currentMastery >= rule.mastery_threshold) {
        unlocked.push(rule.target_id);
      } else {
        locked.push({
          id: rule.target_id,
          reason: `Mastery untuk ${rule.knowledgeComponent.nama} belum mencapai threshold`,
          requiredMastery: rule.mastery_threshold,
          currentMastery,
        });
      }
    }

    return { unlockedSubmateris: unlocked, lockedSubmateris: locked };
  }

  /**
   * Sync progress summary berdasarkan completion submateri dan mastery.
   */
  async syncModuleProgressSummary(
    siswaId: string,
    modulId: string,
  ): Promise<void> {
    const progress = await prisma.progress.findUnique({
      where: { siswa_id_modul_id: { siswa_id: siswaId, modul_id: modulId } },
    });

    if (!progress) return;

    // Hitung completion rate
    const totalSubmateris = await prisma.submateri.count({
      where: { materi: { modul_id: modulId } },
    });

    const completedSubmateris = await prisma.progressDetail.count({
      where: {
        siswa_id: siswaId,
        is_completed: true,
        submateri: { materi: { modul_id: modulId } },
      },
    });

    const completionRate =
      totalSubmateris > 0 ? completedSubmateris / totalSubmateris : 0;

    // Hitung nilai akhir berdasarkan pretest, posttest, dan mastery
    const avgMastery = await prisma.studentKnowledgeState.aggregate({
      where: { siswa_id: siswaId, modul_id: modulId },
      _avg: { p_mastery_current: true },
    });

    const nilaiAkhir =
      (progress.skor_pretest ?? 0) * 0.3 +
      (progress.skor_posttest ?? 0) * 0.4 +
      (avgMastery._avg.p_mastery_current ?? 0) * 100 * 0.3;

    const isLulus = nilaiAkhir >= 60; // Threshold sederhana

    await prisma.progress.update({
      where: { id: progress.id },
      data: {
        nilai_akhir: nilaiAkhir,
        is_lulus: isLulus,
      },
    });
  }

  /**
   * Helper: Update mastery dengan BKT formula.
   */
  private updateMastery(
    currentMastery: number,
    isCorrect: boolean,
    params: BKTParams,
  ): number {
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
  }
}
