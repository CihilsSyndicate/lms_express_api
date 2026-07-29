import { prisma } from '../../../../lib/prisma';

export interface StudyRoomQuestion {
  id: string;
  text: string;
  options: { key: string; label: string }[];
  isComputationalThinking?: boolean;
  knowledgeComponentId?: string | null;
  ctAspect?: string | null;
  ceritaCT?: string | null;
}

export interface StudyRoomAssessment {
  id: string;
  title: string;
  questions: StudyRoomQuestion[];
  timeLimit: number | null;
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
  quizType?: string;
  ctGroupId?: string | null;
  ctStory?: string | null;
  ctAspect?: string | null;
  judul: string;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
  question?: string;
  correctAnswer?: string;
  skor?: number;
  quizImgQuestionUrl?: string | null;
  quizAnswerOptions?: { id: string; option: string }[];
  timeLimit?: number | null;
  quizGroupId?: string | null;
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
  isTestComputationalThinking: boolean;
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

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function assignQuestions<T>(allItems: T[], count: number): T[] {
  const shuffled = shuffleArray([...allItems]);
  if (count > 0 && count < shuffled.length) {
    return shuffled.slice(0, count);
  }
  return shuffled;
}

function mapPretestQuestions(
  pretest: any,
  selectedIds: string[],
): StudyRoomQuestion[] {
  if (!pretest?.pretestQuestions) return [];
  const allQs = pretest.pretestQuestions;
  const qs = selectedIds.length > 0
    ? allQs.filter((q: any) => selectedIds.includes(q.id))
    : allQs;
  const shuffled = shuffleArray(qs);
  return shuffled.map((q: any) => {
    const skillMap = q.questionMaps?.[0];
    const kc = skillMap?.knowledgeComponent;
    return {
      id: q.id,
      text: q.pertanyaan,
      options: (q.answerOptions ?? []).map((opt: any, idx: number) => ({
        key: OPTION_KEYS[idx] ?? `opt_${idx}`,
        label: opt.option,
      })),
      isComputationalThinking: !!skillMap,
      knowledgeComponentId: kc?.id ?? null,
      ctAspect: q.ctAspect ?? kc?.code ?? null,
      ceritaCT: q.ctStory ?? null,
    };
  });
}

function mapPosttestQuestions(
  posttest: any,
  selectedIds: string[],
  pretestQuestions: any[],
): StudyRoomQuestion[] {
  if (!pretestQuestions || pretestQuestions.length === 0) return [];
  const qById = new Map(pretestQuestions.map((q: any) => [q.id, q]));
  const qs = selectedIds.length > 0
    ? selectedIds.map((id: string) => qById.get(id)).filter(Boolean)
    : pretestQuestions;
  return qs.map((q: any) => {
    const skillMap = q.questionMaps?.[0];
    const kc = skillMap?.knowledgeComponent;
    return {
      id: q.id,
      text: q.pertanyaan,
      options: (q.answerOptions ?? []).map((opt: any, idx: number) => ({
        key: OPTION_KEYS[idx] ?? `opt_${idx}`,
        label: opt.option,
      })),
      isComputationalThinking: !!skillMap,
      knowledgeComponentId: kc?.id ?? null,
      ctAspect: q.ctAspect ?? kc?.code ?? null,
      ceritaCT: q.ctStory ?? null,
    };
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

function parseAssignedQuestions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * Given pretest question IDs, find the matching posttest questions
 * by linking through questionNumber on both SoalPretest and SoalPosttest.
 */
function linkPosttestFromPretest(
  pretestQuestionIds: string[],
  allPretestQuestions: { id: string; questionNumber?: number | null }[],
  allPosttestQuestions: { id: string; questionNumber?: number | null }[],
): string[] {
  const numberSet = new Set<number>();
  for (const pq of allPretestQuestions) {
    if (pretestQuestionIds.includes(pq.id) && pq.questionNumber != null) {
      numberSet.add(pq.questionNumber);
    }
  }
  if (numberSet.size === 0) return [];
  return allPosttestQuestions
    .filter((q) => q.questionNumber != null && numberSet.has(q.questionNumber))
    .sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
    .map((q) => q.id);
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
          pretestSettings: true,
          pretestQuestions: {
            include: {
              answerOptions: true,
              questionMaps: {
                include: {
                  knowledgeComponent: true,
                },
              },
            },
            orderBy: { questionNumber: { sort: 'asc', nulls: 'last' } },
          },
        },
      },
      posttest: {
        include: {
          posttestSettings: true,
        },
      },
      topiks: {
        orderBy: { createdAt: 'asc' },
        include: {
          topikItems: { orderBy: { orderNumber: 'asc' } },
          materis: true,
          quizzes: { include: { quizAnswerOptions: true, quizSettings: true } },
          rangkumans: true,
        },
      },
    },
  });

  if (!modul) throw new Error('Modul tidak ditemukan');

  let progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
  });

  if (!progress) {
    throw new Error('Anda belum terdaftar di modul ini');
  }

  // --- Pretest question assignment ---
  let pretestSelectedIds: string[] = [];
  const pretestQuestions = modul.pretest?.pretestQuestions ?? [];
  if (modul.pretest && pretestQuestions.length > 0) {
    const stored = parseAssignedQuestions(progress.pretestAssignedQuestions);
    const countShown = modul.pretest.pretestSettings?.[0]?.countShownQuestions ?? 0;
    const assignFromPool = () => {
      const assigned = assignQuestions(pretestQuestions, countShown);
      return assigned.map((q: any) => q.id);
    };
    let needPersist = false;
    if (stored.length > 0) {
      const storedValid = stored.filter((id: string) =>
        pretestQuestions.some((q: any) => q.id === id),
      );
      const effectiveCount = countShown > 0 ? countShown : pretestQuestions.length;
      if (storedValid.length !== stored.length || stored.length !== effectiveCount) {
        pretestSelectedIds = assignFromPool();
        needPersist = true;
      } else {
        pretestSelectedIds = stored;
      }
    } else {
      pretestSelectedIds = assignFromPool();
      needPersist = true;
    }
    if (needPersist && pretestSelectedIds.length > 0) {
      progress = await prisma.progress.update({
        where: { id: progress.id },
        data: { pretestAssignedQuestions: JSON.stringify(pretestSelectedIds) },
      });
    }
  }

  // Refresh progress to include updated pretestAssignedQuestions for posttest linking
  progress = await prisma.progress.findUnique({
    where: { id: progress!.id },
  });
  if (!progress) {
    throw new Error('Anda belum terdaftar di modul ini');
  }

  // --- Posttest question assignment ---
  // Posttest uses the same questions as pretest (SoalPretest bank)
  let posttestSelectedIds: string[] = [];
  if (modul.posttest && pretestQuestions.length > 0) {
    const stored = parseAssignedQuestions(progress.posttestAssignedQuestions);
    const countShown = modul.posttest.posttestSettings?.[0]?.countShownQuestions ?? 0;
    const effectiveCount = countShown > 0 ? countShown : pretestQuestions.length;
    let needPersist = false;
    if (stored.length > 0 && stored.length === effectiveCount) {
      posttestSelectedIds = stored;
    } else {
      // Copy from pretest assigned questions (same bank, same IDs)
      const pretestStored = parseAssignedQuestions(progress.pretestAssignedQuestions);
      if (pretestStored.length > 0) {
        // Use the SAME question IDs as pretest, then shuffle for different order
        posttestSelectedIds = shuffleArray(pretestStored);
      } else {
        posttestSelectedIds = assignQuestions(pretestQuestions, effectiveCount).map((q: any) => q.id);
      }
      needPersist = true;
    }
    if (needPersist && posttestSelectedIds.length > 0) {
      progress = await prisma.progress.update({
        where: { id: progress.id },
        data: { posttestAssignedQuestions: JSON.stringify(posttestSelectedIds) },
      });
    }
  }

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

  const pretestTimeLimit = modul.pretest?.pretestSettings?.[0]?.duration != null
    ? modul.pretest.pretestSettings[0].duration * 60
    : null;

  const pretestAssessment: StudyRoomAssessment | null = modul.pretest
    ? {
        id: modul.pretest.id,
        title: modul.pretest.pretestName || 'Pre-Test',
        questions: mapPretestQuestions(
          modul.pretest,
          pretestSelectedIds,
        ),
        timeLimit: pretestTimeLimit,
      }
    : null;

  const posttestTimeLimit = modul.posttest?.posttestSettings?.[0]?.duration != null
    ? modul.posttest.posttestSettings[0].duration * 60
    : null;

  const posttestAssessment: StudyRoomAssessment | null = modul.posttest
    ? {
        id: modul.posttest.id,
        title: 'Post-Test',
        questions: mapPosttestQuestions(
          modul.posttest,
          posttestSelectedIds,
          pretestQuestions,
        ),
        timeLimit: posttestTimeLimit,
      }
    : null;

  const topiks: StudyRoomTopik[] = modul.topiks.map((topik) => {
    const materiItems: StudyRoomItem[] = [];
    const quizItems: StudyRoomItem[] = [];

    for (const ti of topik.topikItems) {
      if (ti.itemType === 'MATERI') {
        const materi = topik.materis.find((m) => ti.itemId === m.id);
        if (materi) {
          materiItems.push({
            id: materi.id,
            itemType: 'MATERI',
            judul: materi.judul,
            isVideo: materi.isVideo,
            videoUrl: materi.isVideo ? materi.videoUrl : null,
            article: materi.article,
          });
        }
      } else if (ti.itemType === 'QUIZ') {
        const quiz = topik.quizzes.find((q) => ti.itemId === q.id);
        if (quiz) {
            quizItems.push({
            id: quiz.id,
            itemType: 'QUIZ',
            quizType: quiz.quizType,
            ctGroupId: quiz.ctGroupId,
            ctStory: quiz.ctStory,
            ctAspect: quiz.ctAspect,
            quizGroupId: quiz.quizGroupId,
            judul: quiz.judul ?? quiz.question,
            question: quiz.question,
            correctAnswer: quiz.correctAnswer,
            skor: quiz.skor,
            quizImgQuestionUrl: quiz.quizImgQuestionUrl,
            quizAnswerOptions: quiz.quizAnswerOptions.map((o) => ({
              id: o.id,
              option: o.option,
            })),
            timeLimit: quiz.quizSettings[0]?.timeLimit ?? null,
          });
        }
      } else if (ti.itemType === 'RANGKUMAN_TOPIK') {
        const rangkuman = (topik as any).rangkumans?.find((r: any) => r.id === ti.itemId);
        if (rangkuman) {
          materiItems.push({
            id: rangkuman.id,
            itemType: 'RANGKUMAN_TOPIK',
            judul: rangkuman.judul,
            article: rangkuman.konten ?? null,
          });
        }
      }
    }

    return {
      id: topik.id,
      nama: topik.nama,
      rangkumanTopik: topik.rangkumanTopik ?? null,
      items: [
        ...materiItems,
        ...quizItems,
      ],
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
    isTestComputationalThinking: modul.isTestComputationalThinking,
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
