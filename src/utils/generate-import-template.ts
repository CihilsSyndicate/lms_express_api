import ExcelJS from 'exceljs';

const PURPLE = '7557ea';
const PURPLE_LIGHT = 'f0ebff';
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const SAMPLE_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FF6b7280' }, italic: true, size: 10 };

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PURPLE}` } };
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });
  row.height = 28;
}

function styleSample(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = SAMPLE_FONT;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PURPLE_LIGHT}` } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  row.height = 22;
}

function addDropdown(ws: ExcelJS.Worksheet, col: string, fromRow: number, toRow: number, values: string[]) {
  const formulaStr = `"${values.join(',')}"`;
  for (let r = fromRow; r <= toRow; r++) {
    const cell = ws.getCell(`${col}${r}`);
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaStr],
      showErrorMessage: true,
      errorTitle: 'Nilai tidak valid',
      error: `Pilih salah satu: ${values.join(', ')}`,
    };
  }
}

export async function generateImportTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LMS Tutor';
  wb.created = new Date();

  // ──────────────── PETUNJUK ────────────────
  const petunjuk = wb.addWorksheet('PETUNJUK');
  petunjuk.properties.tabColor = { argb: `FF${PURPLE}` };
  petunjuk.getColumn('A').width = 22;
  petunjuk.getColumn('B').width = 20;
  petunjuk.getColumn('C').width = 18;
  petunjuk.getColumn('D').width = 10;
  petunjuk.getColumn('E').width = 60;

  const title = petunjuk.getRow(1);
  title.getCell('A').value = '📋 Panduan Import Modul — LMS Tutor';
  title.getCell('A').font = { bold: true, size: 14, color: { argb: `FF${PURPLE}` } };
  title.getCell('A').alignment = { vertical: 'middle' };
  title.height = 32;
  petunjuk.mergeCells('A1:E1');

  const sub = petunjuk.getRow(2);
  sub.getCell('A').value = 'Isi setiap sheet sesuai panduan di bawah. Jangan ubah nama sheet atau urutan kolom header. Baris berwarna ungu muda adalah contoh — boleh dihapus.';
  sub.getCell('A').font = { size: 10, color: { argb: 'FF6b7280' } };
  sub.height = 18;
  petunjuk.mergeCells('A2:E2');

  petunjuk.addRow([]);

  const hdr = petunjuk.addRow(['Sheet', 'Kolom', 'Tipe Data', 'Wajib?', 'Keterangan']);
  styleHeader(hdr);

  const guide: [string, string, string, string, string][] = [
    // MODUL
    ['MODUL', 'moduleName', 'Teks', 'Ya', 'Nama modul (judul utama)'],
    ['MODUL', 'subtitle', 'Teks', 'Ya', 'Subjudul singkat modul'],
    ['MODUL', 'description', 'Teks', 'Ya', 'Deskripsi panjang modul'],
    ['MODUL', 'targetTime', 'Angka', 'Ya', 'Estimasi waktu belajar (dalam menit), contoh: 120'],
    ['MODUL', 'difficulty', 'Teks', 'Ya', 'Tingkat kesulitan: mudah / sedang / sulit'],
    ['MODUL', 'level', 'Teks', 'Tidak', 'Jenjang pendidikan: SD / SMP / SMA'],
    ['MODUL', 'class', 'Teks', 'Tidak', 'Kelas, contoh: 4 (untuk kelas 4 SD)'],
    ['MODUL', 'modulType', 'Pilihan', 'Tidak', 'SISWA (default) atau UMUM'],
    ['MODUL', 'hasCertificate', 'TRUE/FALSE', 'Tidak', 'TRUE jika modul memberikan sertifikat saat lulus'],
    ['MODUL', 'isPaid', 'TRUE/FALSE', 'Tidak', 'TRUE jika modul berbayar'],
    ['MODUL', 'pretestPostTestEnabled', 'TRUE/FALSE', 'Tidak', 'TRUE (default) untuk aktifkan pretest/posttest'],
    ['MODUL', 'isDraft', 'TRUE/FALSE', 'Tidak', 'TRUE = simpan sebagai draft (default: TRUE)'],
    // TOPIK
    ['TOPIK', 'topik_ref', 'Kode Unik', 'Ya', 'Kode singkat buatan Anda, mis. T1, T2 — dipakai di sheet lain untuk menghubungkan data'],
    ['TOPIK', 'nama', 'Teks', 'Ya', 'Nama topik, mis. Pengenalan Bilangan'],
    ['TOPIK', 'isComputationalThinking', 'TRUE/FALSE', 'Tidak', 'TRUE jika topik ini adalah topik Computational Thinking (CT)'],
    // MATERI
    ['MATERI', 'topik_ref', 'Kode Unik', 'Ya', 'Harus sama dengan topik_ref di sheet TOPIK'],
    ['MATERI', 'judul', 'Teks', 'Ya', 'Judul materi'],
    ['MATERI', 'tipe', 'Pilihan', 'Ya', 'VIDEO, ARTIKEL, atau SLIDES'],
    ['MATERI', 'video_url', 'URL', 'Kondisional', 'URL YouTube atau video (wajib jika tipe = VIDEO atau SLIDES)'],
    ['MATERI', 'article_content', 'Teks Panjang', 'Kondisional', 'Isi artikel dalam teks biasa atau HTML (wajib jika tipe = ARTIKEL)'],
    // RANGKUMAN
    ['RANGKUMAN', 'topik_ref', 'Kode Unik', 'Ya', 'Harus sama dengan topik_ref di sheet TOPIK'],
    ['RANGKUMAN', 'judul', 'Teks', 'Ya', 'Judul rangkuman topik'],
    ['RANGKUMAN', 'konten', 'Teks Panjang', 'Tidak', 'Isi rangkuman dalam teks biasa atau HTML'],
    // QUIZ_GROUP
    ['QUIZ_GROUP', 'group_ref', 'Kode Unik', 'Ya', 'Kode singkat buatan Anda, mis. G1, G2 — dipakai di sheet QUIZ'],
    ['QUIZ_GROUP', 'topik_ref', 'Kode Unik', 'Ya', 'Harus sama dengan topik_ref di sheet TOPIK'],
    ['QUIZ_GROUP', 'nama', 'Teks', 'Ya', 'Nama kelompok kuis, mis. Latihan Soal Topik 1'],
    ['QUIZ_GROUP', 'quiz_type', 'Pilihan', 'Ya', 'REGULER atau COMPUTATIONAL_THINKING'],
    // QUIZ
    ['QUIZ', 'group_ref', 'Kode Unik', 'Ya', 'Harus sama dengan group_ref di sheet QUIZ_GROUP'],
    ['QUIZ', 'pertanyaan', 'Teks', 'Ya', 'Teks pertanyaan kuis'],
    ['QUIZ', 'opsi_a', 'Teks', 'Ya', 'Pilihan jawaban A'],
    ['QUIZ', 'opsi_b', 'Teks', 'Ya', 'Pilihan jawaban B'],
    ['QUIZ', 'opsi_c', 'Teks', 'Ya', 'Pilihan jawaban C'],
    ['QUIZ', 'opsi_d', 'Teks', 'Ya', 'Pilihan jawaban D'],
    ['QUIZ', 'jawaban_benar', 'Pilihan', 'Ya', 'Huruf jawaban yang benar: A, B, C, atau D'],
    ['QUIZ', 'skor', 'Angka', 'Tidak', 'Skor per soal (default: 10)'],
    // PRETEST_SOAL
    ['PRETEST_SOAL', 'pertanyaan', 'Teks', 'Ya', 'Teks soal pretest'],
    ['PRETEST_SOAL', 'opsi_a', 'Teks', 'Ya', 'Pilihan jawaban A'],
    ['PRETEST_SOAL', 'opsi_b', 'Teks', 'Ya', 'Pilihan jawaban B'],
    ['PRETEST_SOAL', 'opsi_c', 'Teks', 'Ya', 'Pilihan jawaban C'],
    ['PRETEST_SOAL', 'opsi_d', 'Teks', 'Ya', 'Pilihan jawaban D'],
    ['PRETEST_SOAL', 'jawaban_benar', 'Pilihan', 'Ya', 'A, B, C, atau D'],
    ['PRETEST_SOAL', 'skor', 'Angka', 'Tidak', 'Skor per soal (default: 10)'],
    ['PRETEST_SOAL', 'pretest_duration_minutes', 'Angka', 'Hanya baris 1', 'Durasi pretest dalam menit — HANYA isi di baris pertama data'],
    ['PRETEST_SOAL', 'pretest_countShown', 'Angka', 'Hanya baris 1', 'Jumlah soal yang ditampilkan ke siswa — HANYA isi di baris pertama data'],
    // POSTTEST_SETTINGS
    ['POSTTEST_SETTINGS', 'posttest_duration_minutes', 'Angka', 'Ya', 'Durasi posttest dalam menit'],
    ['POSTTEST_SETTINGS', 'posttest_countShown', 'Angka', 'Ya', 'Jumlah soal posttest yang ditampilkan ke siswa (0 = semua soal pretest)'],
  ];

  guide.forEach(([sheet, kolom, tipe, wajib, ket]) => {
    const r = petunjuk.addRow([sheet, kolom, tipe, wajib, ket]);
    r.height = 20;
    r.getCell('A').font = { bold: true, color: { argb: `FF${PURPLE}` }, size: 10 };
    r.getCell('D').font = { bold: true, color: { argb: wajib === 'Ya' ? 'FFdc2626' : 'FF16a34a' }, size: 10 };
    r.eachCell((c) => { c.alignment = { vertical: 'middle', wrapText: true }; });
  });

  petunjuk.addRow([]);
  const note = petunjuk.addRow(['⚠️ CATATAN PENTING', '', '', '', '']);
  note.getCell('A').font = { bold: true, size: 11, color: { argb: 'FFdc2626' } };
  note.height = 24;

  const notes = [
    'Pretest dan posttest BERBAGI bank soal yang sama. Soal yang Anda tulis di PRETEST_SOAL otomatis digunakan untuk posttest.',
    'Sheet POSTTEST_SETTINGS hanya mengatur durasi dan jumlah soal yang DITAMPILKAN dari bank soal pretest.',
    'Urutan materi, rangkuman, dan kuis dalam setiap topik ditentukan oleh urutan baris pada masing-masing sheet.',
    'topik_ref dan group_ref bersifat case-sensitive. T1 dan t1 dianggap berbeda.',
    'Jangan mengubah nama atau urutan kolom header pada setiap sheet.',
  ];
  notes.forEach((n) => {
    const r = petunjuk.addRow(['', '', '', '', n]);
    r.getCell('E').font = { size: 10, color: { argb: 'FF374151' } };
    r.getCell('E').alignment = { wrapText: true };
    r.height = 20;
  });

  // ──────────────── MODUL ────────────────
  const modulSheet = wb.addWorksheet('MODUL');
  modulSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  const modulCols = [
    { header: 'moduleName', key: 'moduleName', width: 30 },
    { header: 'subtitle', key: 'subtitle', width: 30 },
    { header: 'description', key: 'description', width: 50 },
    { header: 'targetTime', key: 'targetTime', width: 14 },
    { header: 'difficulty', key: 'difficulty', width: 14 },
    { header: 'level', key: 'level', width: 10 },
    { header: 'class', key: 'class', width: 10 },
    { header: 'modulType', key: 'modulType', width: 14 },
    { header: 'hasCertificate', key: 'hasCertificate', width: 16 },
    { header: 'isPaid', key: 'isPaid', width: 10 },
    { header: 'pretestPostTestEnabled', key: 'pretestPostTestEnabled', width: 22 },
    { header: 'isDraft', key: 'isDraft', width: 10 },
  ];
  modulSheet.columns = modulCols;
  styleHeader(modulSheet.getRow(1));
  const modulSample = modulSheet.addRow(['Matematika Dasar', 'Belajar hitung dari nol', 'Modul ini dirancang untuk siswa SD kelas 4 yang ingin memahami operasi dasar matematika.', 120, 'mudah', 'SD', '4', 'SISWA', false, false, true, true]);
  styleSample(modulSample);
  addDropdown(modulSheet, 'E', 2, 100, ['mudah', 'sedang', 'sulit']);
  addDropdown(modulSheet, 'F', 2, 100, ['SD', 'SMP', 'SMA', 'Umum']);
  addDropdown(modulSheet, 'H', 2, 100, ['SISWA', 'UMUM']);
  addDropdown(modulSheet, 'I', 2, 100, ['TRUE', 'FALSE']);
  addDropdown(modulSheet, 'J', 2, 100, ['TRUE', 'FALSE']);
  addDropdown(modulSheet, 'K', 2, 100, ['TRUE', 'FALSE']);
  addDropdown(modulSheet, 'L', 2, 100, ['TRUE', 'FALSE']);

  // ──────────────── TOPIK ────────────────
  const topikSheet = wb.addWorksheet('TOPIK');
  topikSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  topikSheet.columns = [
    { header: 'topik_ref', key: 'topik_ref', width: 14 },
    { header: 'nama', key: 'nama', width: 40 },
    { header: 'isComputationalThinking', key: 'isComputationalThinking', width: 26 },
  ];
  styleHeader(topikSheet.getRow(1));
  styleSample(topikSheet.addRow(['T1', 'Pengenalan Bilangan', false]));
  styleSample(topikSheet.addRow(['T2', 'Operasi Penjumlahan', false]));
  addDropdown(topikSheet, 'C', 2, 200, ['TRUE', 'FALSE']);

  // ──────────────── MATERI ────────────────
  const materiSheet = wb.addWorksheet('MATERI');
  materiSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  materiSheet.columns = [
    { header: 'topik_ref', key: 'topik_ref', width: 14 },
    { header: 'judul', key: 'judul', width: 35 },
    { header: 'tipe', key: 'tipe', width: 12 },
    { header: 'video_url', key: 'video_url', width: 50 },
    { header: 'article_content', key: 'article_content', width: 80 },
  ];
  styleHeader(materiSheet.getRow(1));
  styleSample(materiSheet.addRow(['T1', 'Video Pengenalan Bilangan', 'VIDEO', 'https://www.youtube.com/watch?v=contoh', '']));
  styleSample(materiSheet.addRow(['T1', 'Artikel: Apa Itu Bilangan?', 'ARTIKEL', '', 'Bilangan adalah simbol yang digunakan untuk menyatakan jumlah atau urutan sesuatu...']));
  styleSample(materiSheet.addRow(['T2', 'Slideshow Penjumlahan', 'SLIDES', 'https://docs.google.com/presentation/d/contoh', '']));
  addDropdown(materiSheet, 'C', 2, 500, ['VIDEO', 'ARTIKEL', 'SLIDES']);

  // ──────────────── RANGKUMAN ────────────────
  const rangkumanSheet = wb.addWorksheet('RANGKUMAN');
  rangkumanSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  rangkumanSheet.columns = [
    { header: 'topik_ref', key: 'topik_ref', width: 14 },
    { header: 'judul', key: 'judul', width: 40 },
    { header: 'konten', key: 'konten', width: 80 },
  ];
  styleHeader(rangkumanSheet.getRow(1));
  styleSample(rangkumanSheet.addRow(['T1', 'Rangkuman Topik 1', 'Bilangan adalah konsep dasar dalam matematika. Ada bilangan asli, cacah, bulat, dan rasional.']));
  styleSample(rangkumanSheet.addRow(['T2', 'Rangkuman Topik 2', 'Penjumlahan adalah operasi dasar yang menggabungkan dua bilangan menjadi satu.']));

  // ──────────────── QUIZ_GROUP ────────────────
  const quizGroupSheet = wb.addWorksheet('QUIZ_GROUP');
  quizGroupSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  quizGroupSheet.columns = [
    { header: 'group_ref', key: 'group_ref', width: 14 },
    { header: 'topik_ref', key: 'topik_ref', width: 14 },
    { header: 'nama', key: 'nama', width: 40 },
    { header: 'quiz_type', key: 'quiz_type', width: 26 },
  ];
  styleHeader(quizGroupSheet.getRow(1));
  styleSample(quizGroupSheet.addRow(['G1', 'T1', 'Kuis Pengenalan Bilangan', 'REGULER']));
  styleSample(quizGroupSheet.addRow(['G2', 'T2', 'Latihan CT Penjumlahan', 'COMPUTATIONAL_THINKING']));
  addDropdown(quizGroupSheet, 'D', 2, 200, ['REGULER', 'COMPUTATIONAL_THINKING']);

  // ──────────────── QUIZ ────────────────
  const quizSheet = wb.addWorksheet('QUIZ');
  quizSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  quizSheet.columns = [
    { header: 'group_ref', key: 'group_ref', width: 14 },
    { header: 'pertanyaan', key: 'pertanyaan', width: 50 },
    { header: 'opsi_a', key: 'opsi_a', width: 25 },
    { header: 'opsi_b', key: 'opsi_b', width: 25 },
    { header: 'opsi_c', key: 'opsi_c', width: 25 },
    { header: 'opsi_d', key: 'opsi_d', width: 25 },
    { header: 'jawaban_benar', key: 'jawaban_benar', width: 16 },
    { header: 'skor', key: 'skor', width: 10 },
  ];
  styleHeader(quizSheet.getRow(1));
  styleSample(quizSheet.addRow(['G1', 'Berapakah nilai dari angka 7?', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'B', 10]));
  styleSample(quizSheet.addRow(['G1', 'Manakah yang termasuk bilangan ganjil?', '2', '4', '5', '8', 'C', 10]));
  addDropdown(quizSheet, 'G', 2, 1000, ['A', 'B', 'C', 'D']);

  // ──────────────── PRETEST_SOAL ────────────────
  const pretestSheet = wb.addWorksheet('PRETEST_SOAL');
  pretestSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  pretestSheet.columns = [
    { header: 'pertanyaan', key: 'pertanyaan', width: 50 },
    { header: 'opsi_a', key: 'opsi_a', width: 25 },
    { header: 'opsi_b', key: 'opsi_b', width: 25 },
    { header: 'opsi_c', key: 'opsi_c', width: 25 },
    { header: 'opsi_d', key: 'opsi_d', width: 25 },
    { header: 'jawaban_benar', key: 'jawaban_benar', width: 16 },
    { header: 'skor', key: 'skor', width: 10 },
    { header: 'pretest_duration_minutes', key: 'pretest_duration_minutes', width: 26 },
    { header: 'pretest_countShown', key: 'pretest_countShown', width: 20 },
  ];
  styleHeader(pretestSheet.getRow(1));
  styleSample(pretestSheet.addRow(['Berapakah 2 + 3?', '4', '5', '6', '7', 'B', 10, 60, 10]));
  styleSample(pretestSheet.addRow(['Manakah bilangan terbesar?', '3', '7', '5', '1', 'B', 10, '', '']));
  addDropdown(pretestSheet, 'F', 2, 500, ['A', 'B', 'C', 'D']);

  // ──────────────── POSTTEST_SETTINGS ────────────────
  const posttestSheet = wb.addWorksheet('POSTTEST_SETTINGS');
  posttestSheet.properties.tabColor = { argb: `FF${PURPLE}` };
  posttestSheet.columns = [
    { header: 'posttest_duration_minutes', key: 'posttest_duration_minutes', width: 28 },
    { header: 'posttest_countShown', key: 'posttest_countShown', width: 24 },
  ];
  styleHeader(posttestSheet.getRow(1));
  const posttestNote = posttestSheet.addRow([90, 10]);
  styleSample(posttestNote);
  posttestSheet.addRow([]);
  const posttestInfo = posttestSheet.addRow(['Catatan: Soal posttest diambil dari bank soal pretest (PRETEST_SOAL). Sheet ini hanya mengatur durasi dan jumlah soal yang ditampilkan.']);
  posttestInfo.getCell('A').font = { size: 10, color: { argb: 'FF6b7280' }, italic: true };
  posttestInfo.getCell('A').alignment = { wrapText: true };
  posttestSheet.mergeCells('A4:B4');

  const buf = await wb.xlsx.writeBuffer();
  return buf as unknown as Buffer;
}
