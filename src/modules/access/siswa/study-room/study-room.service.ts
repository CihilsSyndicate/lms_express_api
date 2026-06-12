import { prisma } from '../../../../lib/prisma';

export interface StudyRoomQuestion {
  id: string;
  text: string;
  options: { key: string; label: string }[];
}

export interface StudyRoomAssessment {
  id: string;
  title: string;
  questions: StudyRoomQuestion[];
}

export interface StudyRoomMateri {
  id: string;
  itemType: 'MATERI';
  judul: string;
  isVideo: boolean;
  videoUrl: string | null;
  article: string | null;
}

export interface StudyRoomItem {
  id: string;
  itemType: 'MATERI' | 'QUIZ' | 'RANGKUMAN_TOPIK';
  judul: string;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
  question?: string;
  correctAnswer?: string;
  skor?: number;
  quizImgQuestionUrl?: string | null;
  quizAnswerOptions?: { id: string; option: string }[];
}

export interface StudyRoomTopik {
  id: string;
  nama: string;
  rangkumanTopik: string | null;
  items: StudyRoomItem[];
}

export interface StudyRoomProgress {
  id: string;
  siswaId: string;
  modulId: string;
  completedContentItems: string[];
  progressPercentage: number;
  pretestScore: number | null;
  pretestCorrectCount: number | null;
  pretestWrongCount: number | null;
  pretestTimeSpent: number | null;
  posttestScore: number | null;
  posttestCorrectCount: number | null;
  posttestWrongCount: number | null;
  posttestTimeSpent: number | null;
  finalScore: number | null;
  status: string;
  isGraduated: boolean;
}

export interface StudyRoomCertificate {
  id: string;
  certificateUrl: string;
  kode_sertif: string;
  issued_at: Date;
}

export interface StudyRoomResponse {
  modulId: string;
  moduleName: string;
  hasCertificate: boolean;
  progress: StudyRoomProgress | null;
  certificate: StudyRoomCertificate | null;
  curriculum: {
    pretest: StudyRoomAssessment | null;
    topiks: StudyRoomTopik[];
    rangkumanAkhir: {
      itemId: string;
      title: string;
      content: string | null;
    } | null;
    posttest: StudyRoomAssessment | null;
  };
}

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

function mapPretestQuestions(pretest: any): StudyRoomQuestion[] {
  if (!pretest?.pretestQuestions) return [];
  return pretest.pretestQuestions.map((q: any) => ({
    id: q.id,
    text: q.pertanyaan,
    options: (q.answerOptions ?? []).map((opt: any, idx: number) => ({
      key: OPTION_KEYS[idx] ?? `opt_${idx}`,
      label: opt.option,
    })),
  }));
}

function mapPosttestQuestions(posttest: any): StudyRoomQuestion[] {
  if (!posttest?.soals) return [];
  return posttest.soals.map((q: any) => {
    const options: { key: string; label: string }[] = [];
    if (Array.isArray(q.pilihan)) {
      q.pilihan.forEach((label: string, idx: number) => {
        options.push({ key: OPTION_KEYS[idx] ?? `opt_${idx}`, label });
      });
    }
    return { id: q.id, text: q.question, options };
  });
}

function parseCompletedContentItems(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((e: any) => e.itemId).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export const getStudyRoomDataService = async (
  modulId: string,
  siswaId: string,
): Promise<StudyRoomResponse> => {
  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
    include: {
      pretest: {
        include: {
          pretestQuestions: {
            include: { answerOptions: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      posttest: {
        include: {
          soals: { orderBy: { createdAt: 'asc' } },
        },
      },
      topiks: {
        orderBy: { createdAt: 'asc' },
        include: {
          topikItems: { orderBy: { orderNumber: 'asc' } },
          materis: true,
          quizzes: { include: { quizAnswerOptions: true } },
        },
      },
    },
  });

  if (!modul) throw new Error('Modul tidak ditemukan');

  const progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
  });

  const progressPayload: StudyRoomProgress | null = progress
    ? {
        id: progress.id,
        siswaId: progress.siswaId,
        modulId: progress.modulId,
        completedContentItems: parseCompletedContentItems(
          progress.completedContentItems,
        ),
        progressPercentage: progress.progressPercentage,
        pretestScore: progress.pretestScore,
        pretestCorrectCount: progress.pretestCorrectCount,
        pretestWrongCount: progress.pretestWrongCount,
        pretestTimeSpent: progress.pretestTimeSpent,
        posttestScore: progress.posttestScore,
        posttestCorrectCount: progress.posttestCorrectCount,
        posttestWrongCount: progress.posttestWrongCount,
        posttestTimeSpent: progress.posttestTimeSpent,
        finalScore: progress.finalScore,
        status: progress.status,
        isGraduated: progress.isGraduated,
      }
    : null;

  const certificate = await prisma.certificate.findFirst({
    where: { siswaId, modulId },
    select: {
      id: true,
      certificateUrl: true,
      kode_sertif: true,
      issued_at: true,
    },
  });

  const pretestAssessment: StudyRoomAssessment | null = modul.pretest
    ? {
        id: modul.pretest.id,
        title: modul.pretest.pretestName || 'Pre-Test',
        questions: mapPretestQuestions(modul.pretest),
      }
    : null;

  const posttestAssessment: StudyRoomAssessment | null = modul.posttest
    ? {
        id: modul.posttest.id,
        title: 'Post-Test',
        questions: mapPosttestQuestions(modul.posttest),
      }
    : null;

  const topiks: StudyRoomTopik[] = modul.topiks.map((topik) => {
    const items: StudyRoomItem[] = [];

    for (const ti of topik.topikItems) {
      if (ti.itemType === 'MATERI') {
        const materi = topik.materis.find((m) => ti.itemId === m.id);
        if (materi) {
          items.push({
            id: materi.id,
            itemType: 'MATERI',
            judul: materi.judul,
            isVideo: materi.isVideo,
            videoUrl: materi.isVideo ? materi.videoUrl : null,
            article: materi.isVideo ? null : materi.article,
          });
        }
      } else if (ti.itemType === 'QUIZ') {
        const quiz = topik.quizzes.find((q) => ti.itemId === q.id);
        if (quiz) {
          items.push({
            id: quiz.id,
            itemType: 'QUIZ',
            judul: '',
            question: quiz.question,
            correctAnswer: quiz.correctAnswer,
            skor: quiz.skor,
            quizImgQuestionUrl: quiz.quizImgQuestionUrl,
            quizAnswerOptions: quiz.quizAnswerOptions.map((o) => ({
              id: o.id,
              option: o.option,
            })),
          });
        }
      }
    }

    if (topik.rangkumanTopik) {
      items.push({
        id: `rangkuman_${topik.id}`,
        itemType: 'RANGKUMAN_TOPIK',
        judul: `Rangkuman ${topik.nama}`,
        article: topik.rangkumanTopik,
      });
    }

    return {
      id: topik.id,
      nama: topik.nama,
      rangkumanTopik: topik.rangkumanTopik ?? null,
      items,
    };
  });

  const rangkumanAkhir = modul.rangkumanAkhir
    ? {
        itemId: 'rangkuman_akhir',
        title: 'Rangkuman Akhir',
        content: modul.rangkumanAkhir,
      }
    : null;

  return {
    modulId: modul.id,
    moduleName: modul.moduleName,
    hasCertificate: modul.hasCertificate,
    progress: progressPayload,
    certificate,
    curriculum: {
      pretest: pretestAssessment,
      topiks,
      rangkumanAkhir,
      posttest: posttestAssessment,
    },
  };
};
