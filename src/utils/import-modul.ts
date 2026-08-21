import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ImportValidationError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

export class ImportValidationException extends Error {
  constructor(public readonly errors: ImportValidationError[]) {
    super('Import validation failed');
  }
}

interface ParsedModul {
  moduleName: string;
  subtitle: string;
  description: string;
  targetTime: number;
  difficulty: string;
  level: string | null;
  class: string | null;
  modulType: 'SISWA' | 'UMUM';
  hasCertificate: boolean;
  isPaid: boolean;
  pretestPostTestEnabled: boolean;
  isDraft: boolean;
}

interface ParsedTopik {
  topik_ref: string;
  nama: string;
  isComputationalThinking: boolean;
}

interface ParsedMateri {
  topik_ref: string;
  judul: string;
  tipe: 'VIDEO' | 'ARTIKEL' | 'SLIDES';
  video_url: string | null;
  article_content: string | null;
}

interface ParsedRangkuman {
  topik_ref: string;
  judul: string;
  konten: string | null;
}

interface ParsedQuizGroup {
  group_ref: string;
  topik_ref: string;
  nama: string;
  quiz_type: 'REGULER' | 'COMPUTATIONAL_THINKING';
}

interface ParsedQuiz {
  group_ref: string;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: 'A' | 'B' | 'C' | 'D';
  skor: number;
}

interface ParsedSoal {
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
  skor: number;
  duration: number | null;
  countShown: number | null;
}

interface ParsedPosttestSettings {
  duration: number;
  countShown: number;
}

interface ParsedData {
  modul: ParsedModul;
  topiks: ParsedTopik[];
  materis: ParsedMateri[];
  rangkumans: ParsedRangkuman[];
  quizGroups: ParsedQuizGroup[];
  quizzes: ParsedQuiz[];
  pretestSoals: ParsedSoal[];
  pretestDuration: number;
  pretestCountShown: number;
  posttestSettings: ParsedPosttestSettings | null;
}

export interface ImportResult {
  modulId: string;
  summary: {
    topik: number;
    materi: number;
    rangkuman: number;
    quizGroup: number;
    quiz: number;
    pretestSoal: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cellStr(row: ExcelJS.Row, colIdx: number): string {
  const val = row.getCell(colIdx).value;
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function cellNum(row: ExcelJS.Row, colIdx: number): number | undefined {
  const val = row.getCell(colIdx).value;
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function cellBool(row: ExcelJS.Row, colIdx: number): boolean {
  const val = row.getCell(colIdx).value;
  if (typeof val === 'boolean') return val;
  const s = String(val ?? '').trim().toUpperCase();
  return s === 'TRUE' || s === '1';
}

function isRowEmpty(row: ExcelJS.Row, numCols: number): boolean {
  for (let i = 1; i <= numCols; i++) {
    const v = row.getCell(i).value;
    if (v !== null && v !== undefined && String(v).trim() !== '') return false;
  }
  return true;
}

// ─── Parse ───────────────────────────────────────────────────────────────────

async function parseWorkbook(buffer: Buffer): Promise<ParsedData> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);

  const errors: ImportValidationError[] = [];

  // ── MODUL ──
  const modulSheet = wb.getWorksheet('MODUL');
  if (!modulSheet) {
    errors.push({ sheet: 'MODUL', row: 0, field: 'sheet', message: 'Sheet MODUL tidak ditemukan' });
    throw new ImportValidationException(errors);
  }
  const modulRow = modulSheet.getRow(2);
  const modul: ParsedModul = {
    moduleName: cellStr(modulRow, 1),
    subtitle: cellStr(modulRow, 2),
    description: cellStr(modulRow, 3),
    targetTime: cellNum(modulRow, 4) ?? 0,
    difficulty: cellStr(modulRow, 5) || 'mudah',
    level: cellStr(modulRow, 6) || null,
    class: cellStr(modulRow, 7) || null,
    modulType: (cellStr(modulRow, 8) as 'SISWA' | 'UMUM') || 'SISWA',
    hasCertificate: cellBool(modulRow, 9),
    isPaid: cellBool(modulRow, 10),
    pretestPostTestEnabled: modulRow.getCell(11).value === null ? true : cellBool(modulRow, 11),
    isDraft: modulRow.getCell(12).value === null ? true : cellBool(modulRow, 12),
  };
  if (!modul.moduleName) errors.push({ sheet: 'MODUL', row: 2, field: 'moduleName', message: 'moduleName wajib diisi' });
  if (!modul.subtitle) errors.push({ sheet: 'MODUL', row: 2, field: 'subtitle', message: 'subtitle wajib diisi' });
  if (!modul.description) errors.push({ sheet: 'MODUL', row: 2, field: 'description', message: 'description wajib diisi' });
  if (!['SISWA', 'UMUM'].includes(modul.modulType)) errors.push({ sheet: 'MODUL', row: 2, field: 'modulType', message: 'modulType harus SISWA atau UMUM' });

  // ── TOPIK ──
  const topikSheet = wb.getWorksheet('TOPIK');
  const topiks: ParsedTopik[] = [];
  if (topikSheet) {
    topikSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 3)) return;
      const ref = cellStr(row, 1);
      const nama = cellStr(row, 2);
      if (!ref) errors.push({ sheet: 'TOPIK', row: rNum, field: 'topik_ref', message: 'topik_ref wajib diisi' });
      if (!nama) errors.push({ sheet: 'TOPIK', row: rNum, field: 'nama', message: 'nama wajib diisi' });
      topiks.push({ topik_ref: ref, nama, isComputationalThinking: cellBool(row, 3) });
    });
  }
  const topikRefs = new Set(topiks.map((t) => t.topik_ref));

  // ── MATERI ──
  const materiSheet = wb.getWorksheet('MATERI');
  const materis: ParsedMateri[] = [];
  if (materiSheet) {
    materiSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 5)) return;
      const topik_ref = cellStr(row, 1);
      const judul = cellStr(row, 2);
      const tipe = cellStr(row, 3).toUpperCase() as 'VIDEO' | 'ARTIKEL' | 'SLIDES';
      const video_url = cellStr(row, 4) || null;
      const article_content = cellStr(row, 5) || null;
      if (!topik_ref) errors.push({ sheet: 'MATERI', row: rNum, field: 'topik_ref', message: 'topik_ref wajib diisi' });
      else if (!topikRefs.has(topik_ref)) errors.push({ sheet: 'MATERI', row: rNum, field: 'topik_ref', message: `topik_ref "${topik_ref}" tidak ditemukan di sheet TOPIK` });
      if (!judul) errors.push({ sheet: 'MATERI', row: rNum, field: 'judul', message: 'judul wajib diisi' });
      if (!['VIDEO', 'ARTIKEL', 'SLIDES'].includes(tipe)) errors.push({ sheet: 'MATERI', row: rNum, field: 'tipe', message: 'tipe harus VIDEO, ARTIKEL, atau SLIDES' });
      if ((tipe === 'VIDEO' || tipe === 'SLIDES') && !video_url) errors.push({ sheet: 'MATERI', row: rNum, field: 'video_url', message: `video_url wajib diisi untuk tipe ${tipe}` });
      if (tipe === 'ARTIKEL' && !article_content) errors.push({ sheet: 'MATERI', row: rNum, field: 'article_content', message: 'article_content wajib diisi untuk tipe ARTIKEL' });
      materis.push({ topik_ref, judul, tipe, video_url, article_content });
    });
  }

  // ── RANGKUMAN ──
  const rangkumanSheet = wb.getWorksheet('RANGKUMAN');
  const rangkumans: ParsedRangkuman[] = [];
  if (rangkumanSheet) {
    rangkumanSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 2)) return;
      const topik_ref = cellStr(row, 1);
      const judul = cellStr(row, 2);
      const konten = cellStr(row, 3) || null;
      if (!topik_ref) errors.push({ sheet: 'RANGKUMAN', row: rNum, field: 'topik_ref', message: 'topik_ref wajib diisi' });
      else if (!topikRefs.has(topik_ref)) errors.push({ sheet: 'RANGKUMAN', row: rNum, field: 'topik_ref', message: `topik_ref "${topik_ref}" tidak ditemukan di sheet TOPIK` });
      if (!judul) errors.push({ sheet: 'RANGKUMAN', row: rNum, field: 'judul', message: 'judul wajib diisi' });
      rangkumans.push({ topik_ref, judul, konten });
    });
  }

  // ── QUIZ_GROUP ──
  const quizGroupSheet = wb.getWorksheet('QUIZ_GROUP');
  const quizGroups: ParsedQuizGroup[] = [];
  if (quizGroupSheet) {
    quizGroupSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 4)) return;
      const group_ref = cellStr(row, 1);
      const topik_ref = cellStr(row, 2);
      const nama = cellStr(row, 3);
      const quiz_type = cellStr(row, 4).toUpperCase() as 'REGULER' | 'COMPUTATIONAL_THINKING';
      if (!group_ref) errors.push({ sheet: 'QUIZ_GROUP', row: rNum, field: 'group_ref', message: 'group_ref wajib diisi' });
      if (!topik_ref) errors.push({ sheet: 'QUIZ_GROUP', row: rNum, field: 'topik_ref', message: 'topik_ref wajib diisi' });
      else if (!topikRefs.has(topik_ref)) errors.push({ sheet: 'QUIZ_GROUP', row: rNum, field: 'topik_ref', message: `topik_ref "${topik_ref}" tidak ditemukan di sheet TOPIK` });
      if (!nama) errors.push({ sheet: 'QUIZ_GROUP', row: rNum, field: 'nama', message: 'nama wajib diisi' });
      if (!['REGULER', 'COMPUTATIONAL_THINKING'].includes(quiz_type)) errors.push({ sheet: 'QUIZ_GROUP', row: rNum, field: 'quiz_type', message: 'quiz_type harus REGULER atau COMPUTATIONAL_THINKING' });
      quizGroups.push({ group_ref, topik_ref, nama, quiz_type });
    });
  }
  const groupRefs = new Set(quizGroups.map((g) => g.group_ref));

  // ── QUIZ ──
  const quizSheet = wb.getWorksheet('QUIZ');
  const quizzes: ParsedQuiz[] = [];
  if (quizSheet) {
    quizSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 7)) return;
      const group_ref = cellStr(row, 1);
      const pertanyaan = cellStr(row, 2);
      const opsi_a = cellStr(row, 3);
      const opsi_b = cellStr(row, 4);
      const opsi_c = cellStr(row, 5);
      const opsi_d = cellStr(row, 6);
      const jawaban_benar = cellStr(row, 7).toUpperCase() as 'A' | 'B' | 'C' | 'D';
      const skor = cellNum(row, 8) ?? 10;
      if (!group_ref) errors.push({ sheet: 'QUIZ', row: rNum, field: 'group_ref', message: 'group_ref wajib diisi' });
      else if (!groupRefs.has(group_ref)) errors.push({ sheet: 'QUIZ', row: rNum, field: 'group_ref', message: `group_ref "${group_ref}" tidak ditemukan di sheet QUIZ_GROUP` });
      if (!pertanyaan) errors.push({ sheet: 'QUIZ', row: rNum, field: 'pertanyaan', message: 'pertanyaan wajib diisi' });
      if (!opsi_a || !opsi_b || !opsi_c || !opsi_d) errors.push({ sheet: 'QUIZ', row: rNum, field: 'opsi', message: 'Semua pilihan (opsi_a hingga opsi_d) wajib diisi' });
      if (!['A', 'B', 'C', 'D'].includes(jawaban_benar)) errors.push({ sheet: 'QUIZ', row: rNum, field: 'jawaban_benar', message: 'jawaban_benar harus A, B, C, atau D' });
      if (skor <= 0) errors.push({ sheet: 'QUIZ', row: rNum, field: 'skor', message: 'skor harus bilangan positif' });
      quizzes.push({ group_ref, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar, skor });
    });
  }

  // ── PRETEST_SOAL ──
  const pretestSheet = wb.getWorksheet('PRETEST_SOAL');
  const pretestSoals: ParsedSoal[] = [];
  let pretestDuration = 60;
  let pretestCountShown = 0;
  if (pretestSheet) {
    pretestSheet.eachRow((row, rNum) => {
      if (rNum === 1 || isRowEmpty(row, 6)) return;
      const pertanyaan = cellStr(row, 1);
      const opsi_a = cellStr(row, 2);
      const opsi_b = cellStr(row, 3);
      const opsi_c = cellStr(row, 4);
      const opsi_d = cellStr(row, 5);
      const jawaban_benar = cellStr(row, 6).toUpperCase();
      const skor = cellNum(row, 7) ?? 10;
      const duration = cellNum(row, 8) ?? null;
      const countShown = cellNum(row, 9) ?? null;
      if (rNum === 2) {
        if (duration !== null) pretestDuration = duration;
        if (countShown !== null) pretestCountShown = countShown;
      }
      if (!pertanyaan) errors.push({ sheet: 'PRETEST_SOAL', row: rNum, field: 'pertanyaan', message: 'pertanyaan wajib diisi' });
      if (!opsi_a || !opsi_b || !opsi_c || !opsi_d) errors.push({ sheet: 'PRETEST_SOAL', row: rNum, field: 'opsi', message: 'Semua pilihan wajib diisi' });
      if (!['A', 'B', 'C', 'D'].includes(jawaban_benar)) errors.push({ sheet: 'PRETEST_SOAL', row: rNum, field: 'jawaban_benar', message: 'jawaban_benar harus A, B, C, atau D' });
      pretestSoals.push({ pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar, skor, duration, countShown });
    });
  }

  // ── POSTTEST_SETTINGS ──
  const posttestSheet = wb.getWorksheet('POSTTEST_SETTINGS');
  let posttestSettings: ParsedPosttestSettings | null = null;
  if (posttestSheet) {
    const posttestRow = posttestSheet.getRow(2);
    const dur = cellNum(posttestRow, 1);
    const cnt = cellNum(posttestRow, 2);
    if (dur !== undefined && cnt !== undefined) {
      posttestSettings = { duration: dur, countShown: cnt };
    }
  }

  if (errors.length > 0) throw new ImportValidationException(errors);

  return { modul, topiks, materis, rangkumans, quizGroups, quizzes, pretestSoals, pretestDuration, pretestCountShown, posttestSettings };
}

// ── Answer letter → option text ──
function resolveAnswer(letter: string, soal: { opsi_a: string; opsi_b: string; opsi_c: string; opsi_d: string }): string {
  const map: Record<string, string> = { A: soal.opsi_a, B: soal.opsi_b, C: soal.opsi_c, D: soal.opsi_d };
  return map[letter.toUpperCase()] ?? letter;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function importModulFromExcel(buffer: Buffer | ArrayBuffer, tutorId: string): Promise<ImportResult> {
  const data = await parseWorkbook(buffer as Buffer);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Modul
    const modul = await tx.modul.create({
      data: {
        moduleName: data.modul.moduleName,
        subtitle: data.modul.subtitle,
        description: data.modul.description,
        targetTime: data.modul.targetTime,
        difficulty: data.modul.difficulty,
        level: data.modul.level ?? null,
        class: data.modul.class ?? null,
        modulType: data.modul.modulType,
        hasCertificate: data.modul.hasCertificate,
        isPaid: data.modul.isPaid,
        pretestPostTestEnabled: data.modul.pretestPostTestEnabled,
        isDraft: data.modul.isDraft,
        tutorId,
      },
    });

    // 2. Topik
    const topikRefMap = new Map<string, string>(); // ref → db id
    for (const t of data.topiks) {
      const topik = await tx.topik.create({
        data: {
          modulId: modul.id,
          nama: t.nama,
          isComputationalThinking: t.isComputationalThinking,
        },
      });
      topikRefMap.set(t.topik_ref, topik.id);
    }

    // Order counter per topik
    const orderCounter = new Map<string, number>();
    const nextOrder = (topikId: string) => {
      const cur = orderCounter.get(topikId) ?? 0;
      orderCounter.set(topikId, cur + 1);
      return cur + 1;
    };

    // 3. Materi
    let materiCount = 0;
    for (const m of data.materis) {
      const topikId = topikRefMap.get(m.topik_ref)!;
      const isVideo = m.tipe === 'VIDEO' || m.tipe === 'SLIDES';
      const materi = await tx.materi.create({
        data: {
          tutorId,
          topikId,
          judul: m.judul,
          isVideo,
          videoUrl: isVideo ? (m.video_url ?? null) : null,
          article: !isVideo ? (m.article_content ?? null) : null,
        },
      });
      await tx.topikItem.create({
        data: { topikId, itemId: materi.id, itemType: 'MATERI', orderNumber: nextOrder(topikId) },
      });
      materiCount++;
    }

    // 4. Rangkuman
    let rangkumanCount = 0;
    for (const r of data.rangkumans) {
      const topikId = topikRefMap.get(r.topik_ref)!;
      const rang = await tx.rangkuman.create({
        data: { tutorId, topikId, judul: r.judul, konten: r.konten ?? null },
      });
      await tx.topikItem.create({
        data: { topikId, itemId: rang.id, itemType: 'RANGKUMAN_TOPIK', orderNumber: nextOrder(topikId) },
      });
      rangkumanCount++;
    }

    // 5. QuizGroup
    const groupRefMap = new Map<string, { groupId: string; topikId: string; quizType: string }>();
    let quizGroupCount = 0;
    for (const g of data.quizGroups) {
      const topikId = topikRefMap.get(g.topik_ref)!;
      const group = await tx.quizGroup.create({
        data: { topikId, nama: g.nama, quizType: g.quiz_type },
      });
      groupRefMap.set(g.group_ref, { groupId: group.id, topikId, quizType: g.quiz_type });
      quizGroupCount++;
    }

    // 6. Quiz questions
    let quizCount = 0;
    // Track which groups already have a TopikItem so we only create one per group
    const groupTopikItemCreated = new Set<string>();
    for (const q of data.quizzes) {
      const { groupId, topikId, quizType } = groupRefMap.get(q.group_ref)!;
      const correctAnswerText = resolveAnswer(q.jawaban_benar, q);
      const quiz = await tx.quiz.create({
        data: {
          topikId,
          quizGroupId: groupId,
          question: q.pertanyaan,
          correctAnswer: correctAnswerText,
          skor: q.skor,
          quizType: quizType as 'REGULER' | 'COMPUTATIONAL_THINKING',
          quizAnswerOptions: {
            createMany: {
              data: [
                { option: q.opsi_a },
                { option: q.opsi_b },
                { option: q.opsi_c },
                { option: q.opsi_d },
              ],
            },
          },
          quizSettings: {
            create: {},
          },
        },
      });
      if (!groupTopikItemCreated.has(groupId)) {
        await tx.topikItem.create({
          data: { topikId, itemId: groupId, itemType: 'QUIZ', orderNumber: nextOrder(topikId) },
        });
        groupTopikItemCreated.add(groupId);
      }
      quizCount++;
    }

    // 7. Pretest + soal
    let pretestSoalCount = 0;
    if (data.pretestSoals.length > 0 && data.modul.pretestPostTestEnabled) {
      const pretest = await tx.pretest.create({
        data: { pretestName: `Pretest ${data.modul.moduleName}` },
      });
      await tx.modul.update({ where: { id: modul.id }, data: { pretestId: pretest.id } });
      await tx.pretestSetting.create({
        data: {
          pretestId: pretest.id,
          duration: data.pretestDuration,
          countShownQuestions: data.pretestCountShown,
        },
      });
      let qNum = 0;
      for (const s of data.pretestSoals) {
        qNum++;
        const correctAnswerText = resolveAnswer(s.jawaban_benar, s);
        const soal = await tx.soalPretest.create({
          data: {
            pretestId: pretest.id,
            pertanyaan: s.pertanyaan,
            correctAnswer: correctAnswerText,
            skor: s.skor,
            questionNumber: qNum,
          },
        });
        await tx.pretestAnswerOptions.createMany({
          data: [
            { soalPretestId: soal.id, option: s.opsi_a },
            { soalPretestId: soal.id, option: s.opsi_b },
            { soalPretestId: soal.id, option: s.opsi_c },
            { soalPretestId: soal.id, option: s.opsi_d },
          ],
        });
        pretestSoalCount++;
      }

      // 8. Posttest (settings only — shares pretest question bank)
      if (data.posttestSettings) {
        const posttest = await tx.posttest.create({
          data: { modul: { connect: { id: modul.id } } },
        });
        await tx.modul.update({ where: { id: modul.id }, data: { posttestId: posttest.id } });
        await tx.posttestSetting.create({
          data: {
            posttestId: posttest.id,
            duration: data.posttestSettings.duration,
            countShownQuestions: data.posttestSettings.countShown,
          },
        });
      }
    }

    return {
      modulId: modul.id,
      summary: {
        topik: data.topiks.length,
        materi: materiCount,
        rangkuman: rangkumanCount,
        quizGroup: quizGroupCount,
        quiz: quizCount,
        pretestSoal: pretestSoalCount,
      },
    };
  });

  return result;
}
