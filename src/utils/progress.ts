import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

export const getAllStudentProgress = async (
  tutorId?: string,
  limit: number = 10,
  cursor?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const cursorWhere = buildCursorWhere(cursorPayload);

    const studentProgress = await prisma.siswa.findMany({
      where: {
        AND: [
          {
            progress: {
              some: {
                modul: {
                  tutorId: tutorId ? tutorId : '',
                },
              },
            },
          },
          cursorWhere,
        ],
      },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        progress: {
          include: {
            modul: true,
            quizScores: true,
            siswa: {
              select: {
                nama_lengkap: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // // Process progress data
    const progressByModules = studentProgress.map((student) => {
      const studentProgress = student.progress.map((progress) => {
        const quizScores = progress.quizScores.map(
          (q: { score: number }) => q.score,
        );
        const averageQuizScore =
          quizScores.length > 0
            ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
            : 0;

        // Determine recommendation
        let recommendation = 'Perlu Penguatan';
        if (Number(progress?.posttestScore) >= 75) {
          recommendation = 'Siap Pengayaan';
        } else if (Number(progress?.posttestScore) >= 60) {
          recommendation = 'Perlu Remedial';
        }

        return {
          id: progress.id,
          moduleName: progress.modul.moduleName,
          pretestScore: progress.pretestScore,
          posttestScore: progress.posttestScore,
          averageQuizScore,
          isGraduated: progress.isGraduated,
          recommendation,
        };
      });

      return {
        siswaId: student.id,
        siswaName: (student as any).name || (student as any).nama_lengkap,
        email: student.email,
        progress: studentProgress,
        createdAt: student.createdAt, // Needed for cursor in buildCursorPaginatedResponse
      };
    });

    return buildCursorPaginatedResponse(progressByModules, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.siswaId,
    }));
  } catch (error) {
    console.error('Error fetching student progress by modules:', error);
    throw error;
  }
};

export const getProgressByStudentId = async (studentId: string) => {
  try {
    const studentData = await prisma.siswa.findUnique({
      where: { id: studentId },
      select: {
        nama_lengkap: true,
        email: true,
        profileImage: true,
        jenjang: true,
        kelas_sekolah: true,
      },
    });

    if (!studentData) {
      throw new Error('Student not found');
    }

    const allProgress = await prisma.progress.findMany({
      where: { siswaId: studentId },
      include: {
        modul: {
          select: {
            id: true,
            moduleName: true,
            level: true,
            class: true,
            moduleImgUrl: true,
            topiks: {
              select: {
                id: true,
                nama: true,
                _count: { select: { materis: true } },
                quizzes: {
                  select: {
                    id: true,
                    quizType: true,
                    topikId: true,
                    quizSettings: {
                      select: {
                        minScoreTreshold: true,
                        isComputationalThinkingEnabled: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        quizScores: true,
      },
    });

    // Build a map of quizId -> Quiz data for quick lookup
    const quizMap = new Map<string, { topikNama: string; quizType: string; minScoreTreshold: number | null }>();
    for (const p of allProgress) {
      for (const topik of p.modul.topiks) {
        for (const quiz of topik.quizzes) {
          quizMap.set(quiz.id, {
            topikNama: topik.nama,
            quizType: quiz.quizType,
            minScoreTreshold: quiz.quizSettings[0]?.minScoreTreshold ?? null,
          });
        }
      }
    }

    const progress = allProgress.map((progress) => {
      const completedItems = (() => {
        try {
          const parsed = JSON.parse(progress.completedContentItems || '[]');
          if (Array.isArray(parsed)) return parsed;
          return [];
        } catch {
          return [];
        }
      })();

      const totalMateri = progress.modul.topiks.reduce(
        (sum, t) => sum + t._count.materis,
        0,
      );
      const completedMateriCount = completedItems.filter(
        (item: any) => item.itemType === 'MATERI',
      ).length;

      // Build quiz records from QuizScores
      const quizRecords = progress.quizScores
        .filter((qs) => qs.quizType === 'QUIZ')
        .map((qs) => {
          const quizData = quizMap.get(qs.questionId);
          return {
            topik: quizData?.topikNama || 'Unknown',
            quizType: (quizData?.quizType as 'REGULER' | 'COMPUTATIONAL_THINKING') || 'REGULER',
            score: qs.score,
            minScoreTreshold: quizData?.minScoreTreshold ?? null,
            status:
              quizData?.minScoreTreshold != null && qs.score >= quizData.minScoreTreshold
                ? ('tuntas' as const)
                : ('di-bawah' as const),
          };
        });

      const scores = progress.quizScores.map((q) => q.score);
      const avgQuiz =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      let recommendation = 'Perlu Penguatan';
      if (progress.posttestScore && progress.posttestScore >= 75) {
        recommendation = 'Siap Pengayaan';
      } else if (progress.posttestScore && progress.posttestScore >= 60) {
        recommendation = 'Perlu Remedial';
      }

      return {
        moduleId: progress.modul.id,
        moduleName: progress.modul.moduleName,
        level: progress.modul.level,
        class: progress.modul.class,
        moduleImgUrl: progress.modul.moduleImgUrl,
        pretestScore: progress.pretestScore,
        posttestScore: progress.posttestScore,
        finalScore: progress.finalScore,
        averageQuizScore: avgQuiz,
        status: progress.status,
        isGraduated: progress.isGraduated,
        progressPercentage: progress.progressPercentage,
        completedMateri: completedMateriCount,
        completionRate: totalMateri > 0
          ? Math.round((completedMateriCount / totalMateri) * 100)
          : 0,
        recommendation,
        quizRecords,
      };
    });

    return {
      studentInfo: {
        fullName: studentData.nama_lengkap,
        email: studentData.email,
        avatarUrl: studentData.profileImage,
      },
      modules: progress,
    };
  } catch (error) {
    console.error('Error fetching student progress by student ID:', error);
    throw error;
  }
};

export const getModuleProgress = async (
  modulId: string,
  tutorId: string,
) => {
  const modul = await prisma.modul.findUnique({ where: { id: modulId } });

  if (!modul) {
    const err = new Error('Modul tidak ditemukan');
    (err as any).statusCode = 404;
    throw err;
  }

  if (modul.tutorId !== tutorId) {
    const err = new Error('Akses ditolak');
    (err as any).statusCode = 403;
    throw err;
  }

  const records = await prisma.progress.findMany({
    where: { modulId },
    include: {
      siswa: {
        select: {
          id: true,
          nama_lengkap: true,
          email: true,
          profileImage: true,
        },
      },
      quizScores: true,
    },
  });

  return records.map((p) => {
    const scores = p.quizScores.map((q) => q.score);
    const avgQuiz =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    let recommendation = 'Perlu Penguatan';
    if (p.posttestScore && p.posttestScore >= 75) {
      recommendation = 'Siap Pengayaan';
    } else if (p.posttestScore && p.posttestScore >= 60) {
      recommendation = 'Perlu Remedial';
    }

    return {
      siswaId: p.siswa.id,
      siswaName: p.siswa.nama_lengkap,
      email: p.siswa.email,
      profileImage: p.siswa.profileImage,
      pretestScore: p.pretestScore,
      posttestScore: p.posttestScore,
      averageQuizScore: avgQuiz,
      progressPercentage: p.progressPercentage,
      status: p.status,
      isGraduated: p.isGraduated,
      recommendation,
    };
  });
};

export const analyzeComputationalThinking = async (studentId: string, modulId?: string) => {
  try {
    const studentData = await prisma.siswa.findUnique({
      where: { id: studentId },
      select: {
        nama_lengkap: true,
        email: true,
        profileImage: true,
        jenjang: true,
        kelas_sekolah: true,
      },
    });

    if (!studentData) {
      throw new Error('Student not found');
    }

    // Get progress records with module info and quiz scores
    const progressRecords = await prisma.progress.findMany({
      where: { siswaId: studentId, ...(modulId ? { modulId } : {}) },
      include: {
        modul: {
          select: {
            id: true,
            moduleName: true,
            level: true,
            class: true,
            moduleImgUrl: true,
            isTestComputationalThinking: true,
            topiks: {
              select: {
                id: true,
                nama: true,
                _count: { select: { materis: true } },
                materis: { select: { id: true } },
              },
            },
          },
        },
        quizScores: true,
      },
    });

    const targetProgress = modulId
      ? progressRecords.find((p) => p.modul.id === modulId)
      : progressRecords[0];

    console.log('[DEBUG analyzeCT] targetProgress found:', !!targetProgress);
    if (targetProgress) {
      console.log('[DEBUG analyzeCT] moduleId:', targetProgress.modul.id, 'topik count:', targetProgress.modul.topiks.length);
      console.log('[DEBUG analyzeCT] topik IDs:', targetProgress.modul.topiks.map(t => t.id));
    } else {
      console.log('[DEBUG analyzeCT] progressRecords count:', progressRecords.length);
      console.log('[DEBUG analyzeCT] modulId param:', modulId);
      if (progressRecords.length > 0) {
        console.log('[DEBUG analyzeCT] available modulIds:', progressRecords.map(p => p.modul.id));
      }
    }

    const modulIds = progressRecords.map((p) => p.modul.id);

    // Get all quiz IDs for CT quizzes across all student modules
    const ctQuizzes = await prisma.quiz.findMany({
      where: {
        topik: { modulId: { in: modulIds } },
        quizType: 'COMPUTATIONAL_THINKING',
      },
      select: {
        id: true,
        topikId: true,
        ctAspect: true,
        topik: { select: { nama: true } },
        quizSettings: {
          select: { minScoreTreshold: true },
        },
      },
    });

    const ctQuizIdSet = new Set(ctQuizzes.map((q) => q.id));

    // Map quiz â†’ topik info for per-topik grouping
    const quizTopikMap = new Map<string, { topikId: string; topikName: string; ctAspect: string | null }>();
    const topikNames = new Map<string, string>();
    for (const q of ctQuizzes) {
      quizTopikMap.set(q.id, { topikId: q.topikId, topikName: q.topik.nama, ctAspect: q.ctAspect });
      topikNames.set(q.topikId, q.topik.nama);
    }

    // Get answer logs for CT quizzes with KC data
    const answerLogs = await prisma.studentAnswerLog.findMany({
      where: {
        siswaId: studentId,
        questionSource: 'QUIZ',
        questionId: { in: Array.from(ctQuizIdSet) },
      },
      select: {
        questionId: true,
        isCorrect: true,
        knowledgeComponent: {
          select: { code: true, nama: true },
        },
      },
    });

    // Map known CT pillar codes
    const pillarAlias: Record<string, string> = {
      decomposition: 'decomposition',
      pattern_recognition: 'patternRecognition',
      'pattern-recognition': 'patternRecognition',
      patternrecognition: 'patternRecognition',
      abstraction: 'abstraction',
      algorithm: 'algorithm',
    };

    // Group by ctAspect (CT pillar) from quiz metadata
    const rawPillar: Record<string, { correct: number; total: number }> = {};
    for (const log of answerLogs) {
      const topikInfo = quizTopikMap.get(log.questionId);
      const code = topikInfo?.ctAspect || log.knowledgeComponent?.code || 'unknown';
      const pillarKey = pillarAlias[code] || code;
      if (!rawPillar[pillarKey]) {
        rawPillar[pillarKey] = { correct: 0, total: 0 };
      }
      rawPillar[pillarKey].total++;
      if (log.isCorrect) rawPillar[pillarKey].correct++;
    }

    // Per-pillar pretest scores
    const targetModulId = targetProgress?.modul.id;
    const pretestLogs = targetModulId
      ? await prisma.studentAnswerLog.findMany({
          where: { siswaId: studentId, modulId: targetModulId, questionSource: 'PRETEST' },
          select: { questionId: true, isCorrect: true },
        })
      : [];

    const pretestMappings =
      pretestLogs.length > 0
        ? await prisma.pretestQuestionSkillMap.findMany({
            where: { pretestQuestionId: { in: pretestLogs.map((l) => l.questionId) } },
            select: {
              pretestQuestionId: true,
              knowledgeComponent: { select: { code: true } },
            },
          })
        : [];

    // Fallback: ctAspect directly from SoalPretest for questions without KC mappings
    const pretestQuestionsMeta = pretestLogs.length > 0
      ? await prisma.soalPretest.findMany({
          where: { id: { in: pretestLogs.map((l) => l.questionId) } },
          select: { id: true, ctAspect: true },
        })
      : [];
    const pretestQuestionAspect = new Map(
      pretestQuestionsMeta
        .filter((q) => !!q.ctAspect)
        .map((q) => [q.id, q.ctAspect as string]),
    );

    const correctByQId = new Map(pretestLogs.map((l) => [l.questionId, l.isCorrect]));
    const rawPretest: Record<string, { correct: number; total: number }> = {};
    const pretestMappedIds = new Set(pretestMappings.map((m) => m.pretestQuestionId));
    for (const m of pretestMappings) {
      const isCorrect = correctByQId.get(m.pretestQuestionId);
      if (isCorrect === undefined) continue;
      const code = m.knowledgeComponent?.code ||
                   pretestQuestionAspect.get(m.pretestQuestionId) || 'unknown';
      const pillarKey = pillarAlias[code.toLowerCase()] || code;
      if (!rawPretest[pillarKey]) rawPretest[pillarKey] = { correct: 0, total: 0 };
      rawPretest[pillarKey].total++;
      if (isCorrect) rawPretest[pillarKey].correct++;
    }
    for (const log of pretestLogs) {
      if (pretestMappedIds.has(log.questionId)) continue;
      const aspect = pretestQuestionAspect.get(log.questionId);
      if (!aspect) continue;
      const pillarKey = pillarAlias[aspect.toLowerCase()] || aspect;
      if (!rawPretest[pillarKey]) rawPretest[pillarKey] = { correct: 0, total: 0 };
      rawPretest[pillarKey].total++;
      if (log.isCorrect) rawPretest[pillarKey].correct++;
    }
    console.log('[DEBUG CT] pretestLogs count:', pretestLogs.length, 'pretestMappings count:', pretestMappings.length);
    console.log('[DEBUG CT] rawPretest keys:', Object.keys(rawPretest), 'values:', JSON.stringify(rawPretest));

    const getPretestScore = (key: string): number => {
      for (const [alias, target] of Object.entries(pillarAlias)) {
        if (target !== key) continue;
        const d = rawPretest[alias];
        if (d && d.total > 0) { const r = Math.round((d.correct / d.total) * 100); console.log('[DEBUG CT] getPretestScore(' + key + ') =', r, '(hit alias', alias + ')'); return r; }
      }
      const direct = rawPretest[key];
      if (direct && direct.total > 0) { const r = Math.round((direct.correct / direct.total) * 100); console.log('[DEBUG CT] getPretestScore(' + key + ') =', r, '(direct hit)'); return r; }
      const totalCorrect = Object.values(rawPretest).reduce((s, v) => s + v.correct, 0);
      const totalAll = Object.values(rawPretest).reduce((s, v) => s + v.total, 0);
      if (totalAll > 0) { const r = Math.round((totalCorrect / totalAll) * 100); console.log('[DEBUG CT] getPretestScore(' + key + ') =', r, '(overall avg)'); return r; }
      console.log('[DEBUG CT] getPretestScore(' + key + ') = 0 (no data)');
      return 0;
    };

    // Per-pillar posttest scores (posttest uses the same question pool as pretest)
    const posttestLogs = targetModulId
      ? await prisma.studentAnswerLog.findMany({
          where: { siswaId: studentId, modulId: targetModulId, questionSource: 'POSTTEST' },
          select: { questionId: true, isCorrect: true },
        })
      : [];

    const posttestMappings =
      posttestLogs.length > 0
        ? await prisma.pretestQuestionSkillMap.findMany({
            where: { pretestQuestionId: { in: posttestLogs.map((l) => l.questionId) } },
            select: {
              pretestQuestionId: true,
              knowledgeComponent: { select: { code: true } },
            },
          })
        : [];

    // Fallback: ctAspect directly from SoalPretest for posttest questions without KC mappings
    const posttestQuestionsMeta = posttestLogs.length > 0
      ? await prisma.soalPretest.findMany({
          where: { id: { in: posttestLogs.map((l) => l.questionId) } },
          select: { id: true, ctAspect: true },
        })
      : [];
    const posttestQuestionAspect = new Map(
      posttestQuestionsMeta
        .filter((q) => !!q.ctAspect)
        .map((q) => [q.id, q.ctAspect as string]),
    );

    const correctByPosttestQId = new Map(posttestLogs.map((l) => [l.questionId, l.isCorrect]));
    const rawPosttest: Record<string, { correct: number; total: number }> = {};
    const posttestMappedIds = new Set(posttestMappings.map((m) => m.pretestQuestionId));
    for (const m of posttestMappings) {
      const isCorrect = correctByPosttestQId.get(m.pretestQuestionId);
      if (isCorrect === undefined) continue;
      const code = m.knowledgeComponent?.code ||
                   posttestQuestionAspect.get(m.pretestQuestionId) || 'unknown';
      const pillarKey = pillarAlias[code.toLowerCase()] || code;
      if (!rawPosttest[pillarKey]) rawPosttest[pillarKey] = { correct: 0, total: 0 };
      rawPosttest[pillarKey].total++;
      if (isCorrect) rawPosttest[pillarKey].correct++;
    }
    for (const log of posttestLogs) {
      if (posttestMappedIds.has(log.questionId)) continue;
      const aspect = posttestQuestionAspect.get(log.questionId);
      if (!aspect) continue;
      const pillarKey = pillarAlias[aspect.toLowerCase()] || aspect;
      if (!rawPosttest[pillarKey]) rawPosttest[pillarKey] = { correct: 0, total: 0 };
      rawPosttest[pillarKey].total++;
      if (log.isCorrect) rawPosttest[pillarKey].correct++;
    }
    console.log('[DEBUG CT] posttestLogs count:', posttestLogs.length, 'posttestMappings count:', posttestMappings.length);
    console.log('[DEBUG CT] rawPosttest keys:', Object.keys(rawPosttest), 'values:', JSON.stringify(rawPosttest));

    const getPosttestScore = (key: string): number => {
      for (const [alias, target] of Object.entries(pillarAlias)) {
        if (target !== key) continue;
        const d = rawPosttest[alias];
        if (d && d.total > 0) { const r = Math.round((d.correct / d.total) * 100); console.log('[DEBUG CT] getPosttestScore(' + key + ') =', r, '(hit alias', alias + ')'); return r; }
      }
      const direct = rawPosttest[key];
      if (direct && direct.total > 0) { const r = Math.round((direct.correct / direct.total) * 100); console.log('[DEBUG CT] getPosttestScore(' + key + ') =', r, '(direct hit)'); return r; }
      const totalCorrect = Object.values(rawPosttest).reduce((s, v) => s + v.correct, 0);
      const totalAll = Object.values(rawPosttest).reduce((s, v) => s + v.total, 0);
      if (totalAll > 0) { const r = Math.round((totalCorrect / totalAll) * 100); console.log('[DEBUG CT] getPosttestScore(' + key + ') =', r, '(overall avg)'); return r; }
      console.log('[DEBUG CT] getPosttestScore(' + key + ') = 0 (no data)');
      return 0;
    };

    const getScore = (key: string): number => {
      for (const [alias, target] of Object.entries(pillarAlias)) {
        if (target === key) {
          const d = rawPillar[alias];
          if (d && d.total > 0) return Math.round((d.correct / d.total) * 100);
        }
      }
      // Fallback: overall CT quiz performance
      const totalCorrect = Object.values(rawPillar).reduce((s, v) => s + v.correct, 0);
      const totalAll = Object.values(rawPillar).reduce((s, v) => s + v.total, 0);
      if (totalAll > 0) return Math.round((totalCorrect / totalAll) * 100);
      // No data at all â€” return neutral score
      return 0;
    };

    const getLabel = (score: number): string => {
      if (score >= 85) return 'Sangat Baik';
      if (score >= 70) return 'Baik';
      if (score >= 50) return 'Perlu Penguatan';
      return 'Butuh Intervensi';
    };

    const decomposition = getScore('decomposition');
    const patternRecognition = getScore('patternRecognition');
    const abstraction = getScore('abstraction');
    const algorithm = getScore('algorithm');

    // â”€â”€ Per-topik CT analysis â”€â”€
    const rawTopikPillar: Record<string, Record<string, { correct: number; total: number }>> = {};
    for (const log of answerLogs) {
      const topikInfo = quizTopikMap.get(log.questionId);
      if (!topikInfo) continue;
      const tId = topikInfo.topikId;
      if (!rawTopikPillar[tId]) rawTopikPillar[tId] = {};
      const aspect = topikInfo.ctAspect || log.knowledgeComponent?.code || 'unknown';
      const pillarKey = pillarAlias[aspect] || aspect;
      if (!rawTopikPillar[tId][pillarKey]) rawTopikPillar[tId][pillarKey] = { correct: 0, total: 0 };
      rawTopikPillar[tId][pillarKey].total++;
      if (log.isCorrect) rawTopikPillar[tId][pillarKey].correct++;
    }

    const getTopikScore = (raw: Record<string, { correct: number; total: number }>, key: string): number => {
      const d = raw[key];
      if (d && d.total > 0) return Math.round((d.correct / d.total) * 100);
      const totalCorrect = Object.values(raw).reduce((s, v) => s + v.correct, 0);
      const totalAll = Object.values(raw).reduce((s, v) => s + v.total, 0);
      if (totalAll > 0) return Math.round((totalCorrect / totalAll) * 100);
      return 0;
    };

    const topikCTAnalysis = Array.from(topikNames.entries()).map(([topikId, topikName]) => {
      const raw = rawTopikPillar[topikId] || {};
      return {
        topikId,
        topikName,
        computationalThinking: {
          decomposition:      { score: getTopikScore(raw, 'decomposition'),      label: getLabel(getTopikScore(raw, 'decomposition')) },
          patternRecognition: { score: getTopikScore(raw, 'patternRecognition'), label: getLabel(getTopikScore(raw, 'patternRecognition')) },
          abstraction:        { score: getTopikScore(raw, 'abstraction'),        label: getLabel(getTopikScore(raw, 'abstraction')) },
          algorithm:          { score: getTopikScore(raw, 'algorithm'),          label: getLabel(getTopikScore(raw, 'algorithm')) },
        },
      };
    });

    // Build quiz records from StudentAnswerLog (QuizScore is never populated for QUIZ type)
    const topikQuizzes = await prisma.quiz.findMany({
      where: { topik: { modulId: { in: modulIds } } },
      select: {
        id: true,
        quizType: true,
        skor: true,
        topik: { select: { nama: true } },
        quizSettings: { select: { minScoreTreshold: true } },
      },
    });

    const quizLookup = new Map<string, { topik: string; quizType: string; skor: number; minScoreTreshold: number | null }>();
    for (const q of topikQuizzes) {
      quizLookup.set(q.id, {
        topik: q.topik.nama,
        quizType: q.quizType,
        skor: q.skor,
        minScoreTreshold: q.quizSettings[0]?.minScoreTreshold ?? null,
      });
    }

    const quizAnswerLogs = await prisma.studentAnswerLog.findMany({
      where: {
        siswaId: studentId,
        modulId: { in: modulIds },
        questionSource: 'QUIZ',
        questionId: { in: Array.from(quizLookup.keys()) },
      },
      select: { questionId: true, isCorrect: true, answeredAt: true },
      orderBy: { answeredAt: 'desc' },
    });

    const latestByQuiz = new Map<string, typeof quizAnswerLogs[0]>();
    for (const log of quizAnswerLogs) {
      if (!latestByQuiz.has(log.questionId)) latestByQuiz.set(log.questionId, log);
    }

    const quizRecords: Array<{
      activityType: string;
      topik: string;
      quizType: 'REGULER' | 'COMPUTATIONAL_THINKING';
      score: number;
      minScoreTreshold: number | null;
      status: 'tuntas' | 'di-bawah';
    }> = Array.from(latestByQuiz.values()).map((log) => {
      const qd = quizLookup.get(log.questionId);
      const score = log.isCorrect ? (qd?.skor ?? 10) : 0;
      const minT = qd?.minScoreTreshold ?? null;
      return {
        activityType: 'Kuis',
        topik: qd?.topik || 'Unknown',
        quizType: (qd?.quizType as 'REGULER' | 'COMPUTATIONAL_THINKING') || 'REGULER',
        score,
        minScoreTreshold: minT,
        status: minT != null && score >= minT ? ('tuntas' as const) : ('di-bawah' as const),
      };
    });

    if (targetProgress?.pretestScore != null) {
      quizRecords.push({
        activityType: 'Pre-Test',
        topik: 'Pre-Test',
        quizType: 'REGULER',
        score: targetProgress.pretestScore,
        minScoreTreshold: null,
        status: targetProgress.pretestScore >= 60 ? 'tuntas' : 'di-bawah',
      });
    }
    if (targetProgress?.posttestScore != null) {
      quizRecords.push({
        activityType: 'Post-Test',
        topik: 'Post-Test',
        quizType: 'REGULER',
        score: targetProgress.posttestScore,
        minScoreTreshold: null,
        status: targetProgress.posttestScore >= 60 ? 'tuntas' : 'di-bawah',
      });
    }

    // Module progress â€” count by topik (not materi) using ProgressDetail
    const totalTopik = targetProgress
      ? targetProgress.modul.topiks.length
      : 0;

    let completedTopik = 0;
    if (targetProgress) {
      const topikIds = targetProgress.modul.topiks.map(t => t.id);
      const topikMateriCount = new Map(
        targetProgress.modul.topiks.map(t => [t.id, t._count.materis]),
      );
      const completedDetails = await prisma.progressDetail.findMany({
        where: {
          siswaId: studentId,
          isCompleted: true,
          materi: { topikId: { in: topikIds } },
        },
        select: {
          materiId: true,
          materi: { select: { topikId: true } },
        },
      });
      const completedPerTopik = new Map<string, Set<string>>();
      for (const d of completedDetails) {
        const tid = d.materi.topikId;
        if (!completedPerTopik.has(tid)) completedPerTopik.set(tid, new Set());
        completedPerTopik.get(tid)!.add(d.materiId);
      }
      for (const [tid, total] of topikMateriCount) {
        const done = completedPerTopik.get(tid);
        if (done && done.size >= total) completedTopik++;
      }
    }

    // ── Topic-level completion: count topics where ALL materis are completed ──
    // Uses completedContentItems JSON from Progress (not ProgressDetail),
    // matching how getProgressByStudentId counts completed materis.
    let totalTopics = 0;
    let completedTopics = 0;
    for (const progress of progressRecords) {
      const completedItems: Array<{ itemId: string; itemType: string }> = (() => {
        try {
          const parsed = JSON.parse(progress.completedContentItems || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      const completedMateriIds = new Set(
        completedItems
          .filter((item) => item.itemType === 'MATERI')
          .map((item) => item.itemId),
      );
      for (const topik of progress.modul.topiks) {
        totalTopics++;
        if (topik.materis.length === 0) { completedTopics++; continue; }
        if (topik.materis.every((m) => completedMateriIds.has(m.id))) {
          completedTopics++;
        }
      }
    }

    let recommendation = 'Perlu Penguatan';
    if (targetProgress?.posttestScore && targetProgress.posttestScore >= 75) {
      recommendation = 'Siap Pengayaan';
    } else if (targetProgress?.posttestScore && targetProgress.posttestScore >= 60) {
      recommendation = 'Perlu Remedial';
    }

    console.log('[DEBUG analyzeCT] totalTopik:', totalTopik, 'completedTopik:', completedTopik);
    console.log('[DEBUG analyzeCT] totalTopics:', totalTopics, 'completedTopics:', completedTopics);

    return {
      studentInfo: {
        fullName: studentData.nama_lengkap,
        email: studentData.email,
        avatarUrl: studentData.profileImage,
      },
      moduleProgress: targetProgress
        ? {
            moduleId: targetProgress.modul.id,
            moduleName: targetProgress.modul.moduleName,
            level: targetProgress.modul.level,
            class: targetProgress.modul.class,
            moduleImgUrl: targetProgress.modul.moduleImgUrl,
            isTestComputationalThinking: targetProgress.modul.isTestComputationalThinking,
            pretestScore: targetProgress.pretestScore,
            posttestScore: targetProgress.posttestScore,
            progressPercentage: targetProgress.progressPercentage,
            totalTopik,
            completedTopik,
          }
        : null,
      computationalThinking: {
        decomposition: { score: decomposition, label: getLabel(decomposition), preTest: getPretestScore('decomposition'), postTest: getPosttestScore('decomposition') },
        patternRecognition: { score: patternRecognition, label: getLabel(patternRecognition), preTest: getPretestScore('patternRecognition'), postTest: getPosttestScore('patternRecognition') },
        abstraction: { score: abstraction, label: getLabel(abstraction), preTest: getPretestScore('abstraction'), postTest: getPosttestScore('abstraction') },
        algorithm: { score: algorithm, label: getLabel(algorithm), preTest: getPretestScore('algorithm'), postTest: getPosttestScore('algorithm') },
      },
      topikCTAnalysis,
      quizRecords,
      recommendation,
      totalTopics,
      completedTopics,
    };
  } catch (error) {
    console.error('Error analyzing computational thinking:', error);
    throw error;
  }
};

