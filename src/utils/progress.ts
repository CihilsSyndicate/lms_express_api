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
    const studentProgress = await prisma.progress.findMany({
      where: {
        siswaId: studentId,
      },
      include: {
        modul: true,
        quizScores: true,
      },
    });

    const studentData = await prisma.siswa.findUnique({
      where: {
        id: studentId,
      },
    });

    const progressByModules = studentProgress.map((progress) => {
      const quizScores = progress.quizScores.map((q) => q.score);
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
      siswaId: studentId,
      siswaName: (studentData as any).name || (studentData as any).nama_lengkap,
      email: studentData?.email,
      progress: progressByModules,
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

export const analyzeComputationalThinking = async (studentId: string) => {
  try {
    const studentComputationalThinking = await prisma.progress.findMany({
      where: {
        siswaId: studentId,
      },
      include: {
        quizScores: true,
        modul: {
          include: {
            computationalThinkings: true,
          },
        },
      },
    });

    return studentComputationalThinking;
  } catch (error) {
    console.error('Error analyzing computational thinking:', error);
    throw error;
  }
};
