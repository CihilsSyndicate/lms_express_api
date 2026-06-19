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
          return JSON.parse(progress.completedContentItems || '[]');
        } catch {
          return [];
        }
      })();

      const totalMateri = progress.modul.topiks.reduce(
        (sum, t) => sum + t._count.materis,
        0,
      );

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
        completionRate: totalMateri > 0
          ? Math.round((completedItems.length / totalMateri) * 100)
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
        quizSettings: {
          select: { minScoreTreshold: true },
        },
      },
    });

    const ctQuizIdSet = new Set(ctQuizzes.map((q) => q.id));

    // Get answer logs for CT quizzes with KC data
    const answerLogs = await prisma.studentAnswerLog.findMany({
      where: {
        siswaId: studentId,
        questionSource: 'QUIZ',
        questionId: { in: Array.from(ctQuizIdSet) },
      },
      select: {
        isCorrect: true,
        knowledgeComponent: {
          select: { code: true, nama: true },
        },
      },
    });

    // Group by knowledge component code (CT pillar)
    const rawPillar: Record<string, { correct: number; total: number }> = {};
    for (const log of answerLogs) {
      const code = log.knowledgeComponent?.code || 'unknown';
      if (!rawPillar[code]) {
        rawPillar[code] = { correct: 0, total: 0 };
      }
      rawPillar[code].total++;
      if (log.isCorrect) rawPillar[code].correct++;
    }

    // Map known CT pillar codes
    const pillarAlias: Record<string, string> = {
      decomposition: 'decomposition',
      pattern_recognition: 'patternRecognition',
      'pattern-recognition': 'patternRecognition',
      patternrecognition: 'patternRecognition',
      abstraction: 'abstraction',
      algorithm: 'algorithm',
    };

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

    const correctByQId = new Map(pretestLogs.map((l) => [l.questionId, l.isCorrect]));
    const rawPretest: Record<string, { correct: number; total: number }> = {};
    for (const m of pretestMappings) {
      const isCorrect = correctByQId.get(m.pretestQuestionId);
      if (isCorrect === undefined) continue;
      const code = m.knowledgeComponent?.code || 'unknown';
      if (!rawPretest[code]) rawPretest[code] = { correct: 0, total: 0 };
      rawPretest[code].total++;
      if (isCorrect) rawPretest[code].correct++;
    }

    const getPretestScore = (key: string): number => {
      for (const [alias, target] of Object.entries(pillarAlias)) {
        if (target !== key) continue;
        const d = rawPretest[alias];
        if (d && d.total > 0) return Math.round((d.correct / d.total) * 100);
      }
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
      // No data at all — return neutral score
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

    // Build quiz records
    const allQuizScores = targetProgress?.quizScores || [];
    const topikQuizzes = await prisma.quiz.findMany({
      where: { topik: { modulId: { in: modulIds } } },
      select: {
        id: true,
        quizType: true,
        topik: { select: { nama: true } },
        quizSettings: { select: { minScoreTreshold: true } },
      },
    });

    const quizLookup = new Map<string, { topik: string; quizType: string; minScoreTreshold: number | null }>();
    for (const q of topikQuizzes) {
      quizLookup.set(q.id, {
        topik: q.topik.nama,
        quizType: q.quizType,
        minScoreTreshold: q.quizSettings[0]?.minScoreTreshold ?? null,
      });
    }

    const quizRecords = allQuizScores
      .filter((qs) => qs.quizType === 'QUIZ')
      .map((qs) => {
        const qd = quizLookup.get(qs.questionId);
        return {
          topik: qd?.topik || 'Unknown',
          quizType: (qd?.quizType as 'REGULER' | 'COMPUTATIONAL_THINKING') || 'REGULER',
          score: qs.score,
          minScoreTreshold: qd?.minScoreTreshold ?? null,
          status:
            qd?.minScoreTreshold != null && qs.score >= qd.minScoreTreshold
              ? ('tuntas' as const)
              : ('di-bawah' as const),
        };
      });

    // Module progress from first module
    const completedItems = targetProgress
      ? (() => {
          try {
            return JSON.parse(targetProgress.completedContentItems || '[]');
          } catch {
            return [];
          }
        })()
      : [];
    const totalMateri = targetProgress
      ? targetProgress.modul.topiks.reduce((s, t) => s + t._count.materis, 0)
      : 0;

    let recommendation = 'Perlu Penguatan';
    if (targetProgress?.posttestScore && targetProgress.posttestScore >= 75) {
      recommendation = 'Siap Pengayaan';
    } else if (targetProgress?.posttestScore && targetProgress.posttestScore >= 60) {
      recommendation = 'Perlu Remedial';
    }

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
            totalMateri,
            completedMateri: completedItems.length,
          }
        : null,
      computationalThinking: {
        decomposition: { score: decomposition, label: getLabel(decomposition), preTest: getPretestScore('decomposition'), postTest: decomposition },
        patternRecognition: { score: patternRecognition, label: getLabel(patternRecognition), preTest: getPretestScore('patternRecognition'), postTest: patternRecognition },
        abstraction: { score: abstraction, label: getLabel(abstraction), preTest: getPretestScore('abstraction'), postTest: abstraction },
        algorithm: { score: algorithm, label: getLabel(algorithm), preTest: getPretestScore('algorithm'), postTest: algorithm },
      },
      quizRecords,
      recommendation,
    };
  } catch (error) {
    console.error('Error analyzing computational thinking:', error);
    throw error;
  }
};
