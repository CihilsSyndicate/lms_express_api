import { prisma } from '../../../../lib/prisma';
import { BKTService } from '../learning/bkt/bkt.service';

export class ProgressService {
  private bktService = new BKTService();

  /**
   * Initialize progress saat siswa mulai modul.
   */
  async initializeProgress(siswaId: string, modulId: string): Promise<void> {
    const existing = await prisma.progress.findUnique({
      where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
    });

    if (existing) return; // Already initialized

    await prisma.progress.create({
      data: {
        siswaId: siswaId,
        modulId: modulId,
      },
    });
  }

  /**
   * Get progress per modul untuk siswa.
   */
  async getProgressByModule(siswaId: string, modulId: string) {
    const progress = await prisma.progress.findUnique({
      where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
      include: {
        modul: true,
      },
    });

    if (!progress) return null;

    // Hitung completion rate
    const totalSubmaterials = await prisma.submateri.count({
      where: { materi: { topik: { modulId: modulId } } },
    });

    const completedSubmaterials = await prisma.progressDetail.count({
      where: {
        siswaId: siswaId,
        isCompleted: true,
        submateri: { materi: { topik: { modulId: modulId } } },
      },
    });

    const completionRate =
      totalSubmaterials > 0
        ? (completedSubmaterials / totalSubmaterials) * 100
        : 0;

    return {
      ...progress,
      completionRate,
    };
  }

  /**
   * Get semua progress siswa.
   */
  async getAllProgressForSiswa(siswaId: string) {
    return await prisma.progress.findMany({
      where: { siswaId: siswaId },
      include: {
        modul: {
          select: { moduleName: true, level: true, class: true },
        },
      },
    });
  }

  /**
   * Update last accessed.
   */
  async updateLastAccessed(siswaId: string, modulId: string): Promise<void> {
    await prisma.progress.updateMany({
      where: { siswaId: siswaId, modulId: modulId },
      data: { lastAccessed: new Date() },
    });
  }

  /**
   * Tandai submateri completed.
   */
  async markSubmateriCompleted(
    siswaId: string,
    submateriId: string,
  ): Promise<void> {
    const submateri = await prisma.submateri.findUnique({
      where: { id: submateriId },
      include: { materi: { include: { topik: { include: { modul: true } } } } },
    });

    if (!submateri) throw new Error('Submateri tidak ditemukan');

    await this.initializeProgress(siswaId, (submateri.materi as any).topik.modulId);

    const existingDetail = await prisma.progressDetail.findFirst({
      where: {
        siswaId: siswaId,
        submateriId: submateriId,
      },
    });

    await prisma.progressDetail.upsert({
      where: {
        id: (existingDetail?.id as string) || "new-id",
      },
      update: {
        isCompleted: true,
        completed_at: new Date(),
      },
      create: {
        siswaId: siswaId,
        submateriId: submateriId,
        isCompleted: true,
        completed_at: new Date(),
      },
    });

    // Sync progress summary
    await this.bktService.syncModuleProgressSummary(
      siswaId,
      (submateri.materi as any).topik.modulId,
    );
  }

  /**
   * Cek completion submateri.
   */
  async isSubmateriCompleted(
    siswaId: string,
    submateriId: string,
  ): Promise<boolean> {
    const detail = await prisma.progressDetail.findFirst({
      where: {
        siswaId: siswaId,
        submateriId: submateriId,
      },
    });

    return detail?.isCompleted ?? false;
  }

  /**
   * Hitung skor pretest.
   */
  async calculatePretestScore(
    siswaId: string,
    modulId: string,
    answers: { questionId: string; answer: string }[],
  ): Promise<number> {
    const pretest = await prisma.pretest.findFirst({
      where: {
        modul: {
          id: modulId,
        },
      },
      include: { pretestQuestions: true },
    });

    if (!pretest) return 0;

    let totalScore = 0;
    const answerLogs: { questionId: string; isCorrect: boolean }[] = [];

    for (const answer of answers) {
      const question = pretest.pretestQuestions.find(
        (item) => item.id === answer.questionId,
      );
      if (question) {
        const isCorrect = question.correctAnswer === answer.answer;
        if (isCorrect) totalScore += question.skor;

        answerLogs.push({ questionId: answer.questionId, isCorrect });

        // Log answer
        await prisma.studentAnswerLog.create({
          data: {
            siswaId: siswaId,
            modulId: modulId,
            questionSource: 'PRETEST',
            questionId: answer.questionId,
            isCorrect: isCorrect,
          },
        });
      }
    }

    // Update progress skor pretest
    await prisma.progress.updateMany({
      where: { siswaId: siswaId, modulId: modulId },
      data: { pretestScore: totalScore },
    });

    // Initialize BKT
    await this.bktService.initializeKnowledgeStateFromPretest(
      siswaId,
      modulId,
      answerLogs,
    );

    return totalScore;
  }

  /**
   * Hitung skor posttest.
   */
  async calculatePosttestScore(
    siswaId: string,
    modulId: string,
    answers: { questionId: string; answer: string }[],
  ): Promise<number> {
    const posttest = await prisma.posttest.findFirst({
      where: { modul: { id: modulId } },
      include: { soals: true },
    });

    if (!posttest) return 0;

    let totalScore = 0;

    for (const answer of answers) {
      const question = posttest.soals.find(
        (item) => item.id === answer.questionId,
      );
      if (question) {
        const isCorrect = question.correctAnswer === answer.answer;
        if (isCorrect) totalScore += question.skor;

        // Log answer
        await prisma.studentAnswerLog.create({
          data: {
            siswaId: siswaId,
            modulId: modulId,
            questionSource: 'POSTTEST',
            questionId: answer.questionId,
            isCorrect: isCorrect,
          },
        });
      }
    }

    // Update progress skor posttest
    await prisma.progress.updateMany({
      where: { siswaId: siswaId, modulId: modulId },
      data: { posttestScore: totalScore },
    });

    // Sync summary
    await this.bktService.syncModuleProgressSummary(siswaId, modulId);

    return totalScore;
  }

  /**
   * Generate certificate jika syarat terpenuhi.
   */
  async generateCertificateIfEligible(
    siswaId: string,
    modulId: string,
  ): Promise<any | null> {
    const progress = await prisma.progress.findUnique({
      where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
      include: { siswa: true, modul: true },
    });

    if (!progress || !progress.isGraduated) return null;

    const existingCert = await prisma.certificate.findFirst({
      where: { siswaId: siswaId, modulId: modulId },
    });

    if (existingCert) return existingCert;

    const certificateCode = `CERT-${siswaId.slice(-4)}-${modulId.slice(-4)}-${Date.now()}`;

    return await prisma.certificate.create({
      data: {
        siswaId: siswaId,
        modulId: modulId,
        kode_sertif: certificateCode,
        certificateUrl: `https://example.com/cert/${certificateCode}`, // Placeholder
      },
    });
  }
}
