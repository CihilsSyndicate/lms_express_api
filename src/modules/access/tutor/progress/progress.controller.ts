import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const getStudentProgressByModules = async (
  req: Request,
  res: Response,
) => {
  try {
    const tutorId = req?.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const studentProgress = await prisma.siswa.findMany({
      where: {
        progress: {
          some: {
            modul: {
              tutorId: tutorId,
            },
          },
        },
      },
      include: {
        progress: {
          include: {
            modul: true,
            quizScores: true,
            siswa: {
              select: {
                name: true,
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
          studentId: progress.siswaId,
          studentName: progress.siswa.name,
          studentEmail: progress.siswa.email,
          progressPercentage: progress.progressPercentage,
          pretestScore: progress.pretestScore,
          posttestScore: progress.posttestScore,
          averageQuizScore: Math.round(averageQuizScore * 100) / 100,
          moduleId: progress.modulId,
          recommendation,
        };
      });

      return {
        studentProgress,
      };
    });

    return res.status(200).json({
      message: 'Student progress retrieved successfully',
      data: progressByModules,
    });
  } catch (err) {
    console.error('Error fetching student progress:', err);
    res.status(500).json({ message: 'Failed to fetch student progress' + err });
  }
};

export const getProgressByStudentId = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const studentProgress = await prisma.progress.findFirst({
      where: {
        siswa: {
          id: studentId as string,
        },
      },
    });

    const studentQuiz = await prisma.quizScore.findMany({
      where: {
        progress: {
          siswaId: studentId as string,
        },
      },
    });

    const quizScores = studentQuiz.map((quiz) => quiz.score);
    const averageQuizScore =
      quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : 0;

    const studentQuizProgress = studentQuiz.map((quiz) => ({
      ...quiz,
      isTuntas: Number(quiz.score) >= averageQuizScore,
    }));

    const thresholdScore = 75;
    const weakTopics = studentQuiz
      .map((quiz, index) => ({
        topic:
          (quiz as { topic?: string; topik?: string; title?: string }).topic ||
          (quiz as { topic?: string; topik?: string; title?: string }).topik ||
          (quiz as { topic?: string; topik?: string; title?: string }).title ||
          `Topik ${index + 1}`,
        score: Number(quiz.score),
      }))
      .filter((item) => item.score < thresholdScore)
      .map((item) => item.topic);

    const conclusion =
      weakTopics.length > 0
        ? `Siswa menunjukkan pemahaman yang baik pada sebagian besar topik, namun perlu mengulas kembali ${weakTopics.join(', ')} karena skor kuis di bawah ambang batas.`
        : 'Siswa menunjukkan pemahaman yang baik pada seluruh topik.';

    return res.status(200).json({
      message: 'Student progress retrieved successfully',
      data: {
        progress: studentProgress,
        quizScores: studentQuiz,
        quizProgress: studentQuizProgress,
        conclusion,
      },
    });
  } catch (err) {
    console.log('Error fetching student progress by ID:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch student progress by ID' + err });
  }
};

export const analyzeComputationalThinking = async (
  req: Request,
  res: Response,
) => {
  try {
    const { studentId } = req.params;
    const computationalThinkingProgress = await prisma.progress.findFirst({
      where: {
        siswa: {
          id: studentId as string,
        },
        include: {
          computationalThinkings: true,
          quizScores: true,
        },
      },
    });

    if (!computationalThinkingProgress) {
      return res
        .status(404)
        .json({ message: 'Progress not found for the specified student ID' });
    }

    return res.status(200).json({
      message: 'Computational thinking progress retrieved successfully',
      data: computationalThinkingProgress,
    });
  } catch (err) {
    console.error('Error fetching computational thinking progress:', err);
    res.status(500).json({
      message: 'Failed to fetch computational thinking progress' + err,
    });
  }
};
