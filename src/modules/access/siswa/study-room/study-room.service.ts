import { prisma } from '../../../../lib/prisma';
import { getSequenceSteps, progressPercentageFor } from '../progress/progress.service';

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
  quizType?: string | undefined;
  ctGroupId?: string | null | undefined;
  ctStory?: string | null | undefined;
  ctAspect?: string | null | undefined;
  ctSubIds?: string[] | undefined;
  judul: string;
  isVideo?: boolean | undefined;
  videoUrl?: string | null | undefined;
  article?: string | null | undefined;
  question?: string | undefined;
  correctAnswer?: string | undefined;
  skor?: number | undefined;
  quizImgQuestionUrl?: string | null | undefined;
  quizAnswerOptions?: { id: string; option: string }[] | undefined;
  timeLimit?: number | null | undefined;
  quizGroupId?: string | null | undefined;
  allowMultipleAttempts?: boolean | undefined;
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
  hasRated?: boolean;
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
    posttest: StudyRoomAssessment | null;
  };
}

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

function shuffleByGroup(qs: any[]): any[] {
  const grouped = new Map<string, any[]>();
  const ungrouped: any[] = [];
  for (const q of qs) {
    if (q.ctGroupId) {
      if (!grouped.has(q.ctGroupId)) grouped.set(q.ctGroupId, []);
      grouped.get(q.ctGroupId)!.push(q);
    } else {
      ungrouped.push(q);
    }
  }
  const units: any[][] = [
    ...ungrouped.map((q) => [q]),
    ...Array.from(grouped.values()),
  ];
  return shuffleArray(units).flat();
}

function shuffleIdsByGroup(ids: string[], allQuestions: any[]): string[] {
  const qById = new Map(allQuestions.map((q: any) => [q.id, q]));
  const qs = ids.map((id) => qById.get(id)).filter(Boolean);
  return shuffleByGroup(qs).map((q: any) => q.id);
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
  const qById = new Map(allQs.map((q: any) => [q.id, q]));
  const qs = selectedIds.length > 0
    ? selectedIds.map((id) => qById.get(id)).filter(Boolean)
    : allQs;
  // No shuffle — order fixed by pretestAssignedQuestions (shuffled once on first assignment, stored in DB)
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
              answerOptions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
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
          quizzes: {
            include: { quizAnswerOptions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }, quizSettings: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          },
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
    // Race-safe: progress row mungkin belum dibuat saat enrollment & GET berjalan paralel
    await prisma.progress.create({
      data: { siswaId, modulId, progressPercentage: 0 },
    });
    progress = await prisma.progress.findUnique({
      where: { siswaId_modulId: { siswaId, modulId } },
    });
  }

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
        posttestSelectedIds = shuffleIdsByGroup(pretestStored, pretestQuestions);
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

  // Recompute progress percentage dengan formula kanonik agar sinkron dengan
  // nilai yang dilihat tutor (progressPercentage kolom ditulis ulang oleh writer).
  if (progress) {
    const steps = await getSequenceSteps(modulId);
    const freshPercentage = progressPercentageFor(progress, steps);
    if (Math.round(freshPercentage) !== Math.round(progress.progressPercentage)) {
      progress = await prisma.progress.update({
        where: { id: progress.id },
        data: { progressPercentage: freshPercentage },
      });
    } else {
      progress = { ...progress, progressPercentage: freshPercentage };
    }
  }

  let hasRated = false;
  if (progress) {
    const ratingCount = await prisma.rating.count({
      where: { modulId, siswaId },
    });
    hasRated = ratingCount > 0;
  }

  const progressPayload: StudyRoomProgress | null = progress
    ? {
        id: progress.id,
        siswaId: progress.siswaId,
        modulId: progress.modulId,
        hasRated,
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
    const ctQuizItems: StudyRoomItem[] = [];

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
          const mapped: StudyRoomItem = {
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
            allowMultipleAttempts: quiz.quizSettings[0]?.allowMultipleAttempts ?? false,
          };
          if (quiz.quizType === 'COMPUTATIONAL_THINKING') {
            ctQuizItems.push(mapped);
          } else {
            quizItems.push(mapped);
          }
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

    // Quizzes are stored directly on topik (not via topikItems) — process them here
    const alreadyMappedIds = new Set([
      ...quizItems.map((q) => q.id),
      ...ctQuizItems.map((q) => q.id),
    ]);
    for (const quiz of topik.quizzes) {
      if (alreadyMappedIds.has(quiz.id)) continue;
      const mapped: StudyRoomItem = {
        id: quiz.id,
        itemType: 'QUIZ',
        quizType: quiz.quizType,
        ctGroupId: quiz.ctGroupId ?? null,
        ctStory: quiz.ctStory ?? null,
        ctAspect: quiz.ctAspect ?? null,
        quizGroupId: quiz.quizGroupId ?? null,
        judul: quiz.judul ?? quiz.question,
        question: quiz.question,
        correctAnswer: quiz.correctAnswer,
        skor: quiz.skor,
        quizImgQuestionUrl: quiz.quizImgQuestionUrl,
        quizAnswerOptions: quiz.quizAnswerOptions.map((o) => ({ id: o.id, option: o.option })),
        timeLimit: quiz.quizSettings[0]?.timeLimit ?? null,
        allowMultipleAttempts: quiz.quizSettings[0]?.allowMultipleAttempts ?? false,
      };
      if (quiz.quizType === 'COMPUTATIONAL_THINKING') {
        ctQuizItems.push(mapped);
      } else {
        quizItems.push(mapped);
      }
    }

    // Preserve individual items for frontend question-data lookup (itemMap.get(subId))
    const allIndividualQuizItems = [...quizItems, ...ctQuizItems];

    // Group REGULER (only from quizItems — CT not yet mixed in)
    let regulerGroupItem: StudyRoomItem | null = null;
    if (quizItems.length > 0) {
      const firstReguler = quizItems[0]!;
      regulerGroupItem = {
        id: firstReguler.id,
        itemType: 'QUIZ',
        quizType: 'REGULER',
        ctGroupId: null,
        ctSubIds: quizItems.map((q) => q.id),
        judul: firstReguler.judul ?? 'Kuis',
        question: firstReguler.question ?? '',
        correctAnswer: firstReguler.correctAnswer ?? '',
        skor: firstReguler.skor,
        quizImgQuestionUrl: firstReguler.quizImgQuestionUrl,
        quizAnswerOptions: firstReguler.quizAnswerOptions,
        timeLimit: quizItems.reduce((m, q) => Math.max(m, q.timeLimit ?? 0), 0) || null,
        allowMultipleAttempts: firstReguler.allowMultipleAttempts ?? false,
      };
    }

    // Group CT separately — never absorbed into REGULER
    let ctGroupItem: StudyRoomItem | null = null;
    if (ctQuizItems.length > 0) {
      const firstCt = ctQuizItems[0]!;
      ctGroupItem = {
        id: firstCt.id,
        itemType: 'QUIZ',
        quizType: 'COMPUTATIONAL_THINKING',
        ctGroupId: null,
        ctSubIds: ctQuizItems.map((q) => q.id),
        ctStory: firstCt.ctStory ?? null,
        ctAspect: firstCt.ctAspect ?? null,
        judul: 'Kuis CT',
        question: firstCt.question ?? '',
        correctAnswer: firstCt.correctAnswer ?? '',
        skor: firstCt.skor,
        quizImgQuestionUrl: firstCt.quizImgQuestionUrl,
        quizAnswerOptions: firstCt.quizAnswerOptions,
        timeLimit: ctQuizItems.reduce((m, q) => Math.max(m, q.timeLimit ?? 0), 0) || null,
        allowMultipleAttempts: firstCt.allowMultipleAttempts ?? false,
      };
    }

    // Group wrappers first (frontend Priority 0/0b marks their ctSubIds as handled),
    // then individual items (skipped in sidebar, but present for question-data lookup).
    const finalQuizItems: StudyRoomItem[] = [
      ...(regulerGroupItem ? [regulerGroupItem] : []),
      ...(ctGroupItem ? [ctGroupItem] : []),
      ...allIndividualQuizItems,
    ];

    return {
      id: topik.id,
      nama: topik.nama,
      rangkumanTopik: topik.rangkumanTopik ?? null,
      items: [
        ...materiItems,
        ...finalQuizItems,
      ],
    };
  });

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
      posttest: posttestAssessment,
    },
  };
};
