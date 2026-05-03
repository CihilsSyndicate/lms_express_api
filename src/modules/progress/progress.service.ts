import { prisma } from '../../lib/prisma';
import { BKTService } from '../bkt/bkt.service';

export class ProgressService {
  private bktService = new BKTService();

  /**
   * Initialize progress saat siswa mulai modul.
   */
  async initializeProgress(siswaId: string, modulId: string): Promise<void> {
    const existing = await prisma.progress.findUnique({
      where: { siswa_id_modul_id: { siswa_id: siswaId, modul_id: modulId } },
    });

    if (existing) return; // Already initialized

    await prisma.progress.create({
      data: {
        siswa_id: siswaId,
        modul_id: modulId,
      },
    });
  }

  /**
   * Get progress per modul untuk siswa.
   */
  async getProgressByModule(siswaId: string, modulId: string) {
    const progress = await prisma.progress.findUnique({
      where: { siswa_id_modul_id: { siswa_id: siswaId, modul_id: modulId } },
      include: {
        modul: true,
      },
    });

    if (!progress) return null;

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
      totalSubmateris > 0 ? (completedSubmateris / totalSubmateris) * 100 : 0;

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
      where: { siswa_id: siswaId },
      include: {
        modul: {
          select: { nama_modul: true, jenjang: true, kelas_sekolah: true },
        },
      },
    });
  }

  /**
   * Update last accessed.
   */
  async updateLastAccessed(siswaId: string, modulId: string): Promise<void> {
    await prisma.progress.updateMany({
      where: { siswa_id: siswaId, modul_id: modulId },
      data: { last_accessed: new Date() },
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
      include: { materi: { include: { modul: true } } },
    });

    if (!submateri) throw new Error('Submateri tidak ditemukan');

    await this.initializeProgress(siswaId, submateri.materi.modul_id);

    const existingDetail = await prisma.progressDetail.findFirst({
      where: {
        siswa_id: siswaId,
        submateri_id: submateriId,
      },
    });

    await prisma.progressDetail.upsert({
      where: {
        id: existingDetail?.id as string,
      },
      update: {
        is_completed: true,
        completed_at: new Date(),
      },
      create: {
        siswa_id: siswaId,
        submateri_id: submateriId,
        is_completed: true,
        completed_at: new Date(),
      },
    });

    // Sync progress summary
    await this.bktService.syncModuleProgressSummary(
      siswaId,
      submateri.materi.modul_id,
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
        siswa_id: siswaId,
        submateri_id: submateriId,
      },
    });

    return detail?.is_completed ?? false;
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
      include: { soals: true },
    });

    if (!pretest) return 0;

    let totalScore = 0;
    const answerLogs: { questionId: string; isCorrect: boolean }[] = [];

    for (const answer of answers) {
      const soal = pretest.soals.find((s) => s.id === answer.questionId);
      if (soal) {
        const isCorrect = soal.jawaban_benar === answer.answer;
        if (isCorrect) totalScore += soal.skor;

        answerLogs.push({ questionId: answer.questionId, isCorrect });

        // Log answer
        await prisma.studentAnswerLog.create({
          data: {
            siswa_id: siswaId,
            modul_id: modulId,
            question_source: 'PRETEST',
            question_id: answer.questionId,
            is_correct: isCorrect,
          },
        });
      }
    }

    // Update progress skor pretest
    await prisma.progress.updateMany({
      where: { siswa_id: siswaId, modul_id: modulId },
      data: { skor_pretest: totalScore },
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
      const soal = posttest.soals.find((s) => s.id === answer.questionId);
      if (soal) {
        const isCorrect = soal.jawaban_benar === answer.answer;
        if (isCorrect) totalScore += soal.skor;

        // Log answer
        await prisma.studentAnswerLog.create({
          data: {
            siswa_id: siswaId,
            modul_id: modulId,
            question_source: 'POSTTEST',
            question_id: answer.questionId,
            is_correct: isCorrect,
          },
        });
      }
    }

    // Update progress skor posttest
    await prisma.progress.updateMany({
      where: { siswa_id: siswaId, modul_id: modulId },
      data: { skor_posttest: totalScore },
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
      where: { siswa_id_modul_id: { siswa_id: siswaId, modul_id: modulId } },
      include: { siswa: true, modul: true },
    });

    if (!progress || !progress.is_lulus) return null;

    const existingCert = await prisma.certificate.findFirst({
      where: { siswa_id: siswaId, modul_id: modulId },
    });

    if (existingCert) return existingCert;

    const kodeSertif = `CERT-${siswaId.slice(-4)}-${modulId.slice(-4)}-${Date.now()}`;

    return await prisma.certificate.create({
      data: {
        siswa_id: siswaId,
        modul_id: modulId,
        kode_sertif: kodeSertif,
        url_sertif: `https://example.com/cert/${kodeSertif}`, // Placeholder
      },
    });
  }
}
