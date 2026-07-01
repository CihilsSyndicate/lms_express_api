import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

const TEST_EMAILS = {
  admin: 'finaladmin@lms.test',
  tutor: 'finaltutor@lms.test',
  siswa: 'finalsiswa@lms.test',
};

async function main() {
  console.log('=== FINAL TEST SEEDER ===\n');

  // =====================================================
  // CLEANUP (only test data by email)
  // =====================================================
  console.log('Cleaning previous test data...');

  const existingSiswa = await prisma.siswa.findUnique({
    where: { email: TEST_EMAILS.siswa },
  });
  if (existingSiswa) {
    await prisma.certificate.deleteMany({
      where: { siswaId: existingSiswa.id },
    });
    await prisma.rating.deleteMany({ where: { siswaId: existingSiswa.id } });
    await prisma.studentKnowledgeState.deleteMany({
      where: { siswaId: existingSiswa.id },
    });
    await prisma.studentAnswerLog.deleteMany({
      where: { siswaId: existingSiswa.id },
    });
    await prisma.progressDetail.deleteMany({
      where: { siswaId: existingSiswa.id },
    });
  }

  const existingTutor = await prisma.tutor.findUnique({
    where: { email: TEST_EMAILS.tutor },
  });
  if (existingTutor) {
    await prisma.modul.deleteMany({ where: { tutorId: existingTutor.id } });
    await prisma.materi.deleteMany({ where: { tutorId: existingTutor.id } });
    await prisma.rangkuman.deleteMany({ where: { tutorId: existingTutor.id } });
    await prisma.socialMedia.deleteMany({
      where: { tutorId: existingTutor.id },
    });
  }

  await prisma.progress.deleteMany({
    where: { siswa: { email: TEST_EMAILS.siswa } },
  });
  await prisma.siswa.deleteMany({ where: { email: TEST_EMAILS.siswa } });
  await prisma.tutor.deleteMany({ where: { email: TEST_EMAILS.tutor } });
  await prisma.admin.deleteMany({ where: { email: TEST_EMAILS.admin } });

  console.log(' Cleanup complete.\n');

  // =====================================================
  // CREATE USERS
  // =====================================================
  console.log('Creating users...');

  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.admin.create({
    data: {
      email: TEST_EMAILS.admin,
      password: adminPassword,
      username: 'finaladmin',
      fullName: 'Admin Final Test',
      gender: 'Laki-laki',
      role: 'admin',
      whatsappNumber: '081234567890',
      isActive: true,
    },
  });
  console.log(` Admin: ${admin.email}`);

  const tutorPassword = await hashPassword('tutor123');
  const tutor = await prisma.tutor.create({
    data: {
      email: TEST_EMAILS.tutor,
      password: tutorPassword,
      fullName: 'Tutor Final Test',
      gender: 'Laki-laki',
      pekerjaan: 'Guru Informatika',
      whatsappNumber: '081234567891',
      lastEducation: 'S1',
      institution: 'Universitas Testing',
      prodi: 'Ilmu Komputer',
      cvPathUrl: 'https://example.com/cv.pdf',
      biografi: 'Tutor untuk final test flow belajar siswa',
      role: 'tutor',
      isActive: true,
    },
  });
  console.log(` Tutor: ${tutor.email}`);

  const siswaPassword = await hashPassword('siswa123');
  const siswa = await prisma.siswa.create({
    data: {
      email: TEST_EMAILS.siswa,
      password: siswaPassword,
      nama_lengkap: 'Siswa Final Lulus',
      jenjang: 'SMA',
      kelas_sekolah: '11 IPA 1',
      role: 'siswa',
      studentType: 'SISWA',
      isActive: true,
    },
  });
  console.log(` Siswa: ${siswa.email}\n`);

  // =====================================================
  // CREATE MODULE
  // =====================================================
  console.log('Creating module...');

  const modul = await prisma.modul.create({
    data: {
      moduleName: 'Modul Test - Algoritma & Pemrograman Dasar',
      subtitle: 'Belajar Algoritma dari Nol',
      description:
        'Modul lengkap untuk testing flow belajar siswa dari awal hingga sertifikat. Mencakup konsep algoritma, flowchart, dan computational thinking.',
      targetTime: 120,
      difficulty: 'Menengah',
      isPaid: false,
      modulPrice: 0,
      level: 'SMA',
      class: '10',
      hasCertificate: true,
      hasStudyGroup: false,
      isDraft: false,
      pretestPostTestEnabled: true,
      isTestComputationalThinking: false,
      modulType: 'SISWA',
      tutorId: tutor.id,
      rangkumanAkhir:
        'Modul ini membahas dasar-dasar algoritma, flowchart, pseudocode, dan computational thinking. Siswa diharapkan mampu menyusun algoritma sederhana dan menerapkan konsep CT dalam pemecahan masalah.',
    },
  });
  console.log(` Module: ${modul.moduleName}\n`);

  // =====================================================
  // COMPUTATIONAL THINKING ASPECTS
  // =====================================================
  console.log('Creating Computational Thinking aspects...');

  const ctAspects = [
    {
      aspek: 'Decomposition',
      deskripsi:
        'Memecah masalah kompleks menjadi bagian-bagian kecil yang lebih mudah dikelola.',
    },
    {
      aspek: 'Pattern Recognition',
      deskripsi: 'Mengenali pola dan kesamaan dalam data atau masalah.',
    },
    {
      aspek: 'Abstraction',
      deskripsi:
        'Menyaring informasi penting dan mengabaikan detail yang tidak relevan.',
    },
    {
      aspek: 'Algorithm Design',
      deskripsi:
        'Menyusun langkah-langkah sistematis untuk menyelesaikan masalah.',
    },
  ];

  for (const ct of ctAspects) {
    await prisma.computationalThinking.create({
      data: {
        modulId: modul.id,
        aspek: ct.aspek,
        deskripsi: ct.deskripsi,
      },
    });
  }
  console.log(` CT Aspects: ${ctAspects.length} records\n`);

  // =====================================================
  // PRETEST + SETTINGS
  // =====================================================
  console.log('Creating Pretest...');

  const pretest = await prisma.pretest.create({
    data: { pretestName: `Pretest - ${modul.moduleName}` },
  });

  await prisma.modul.update({
    where: { id: modul.id },
    data: { pretestId: pretest.id },
  });

  await prisma.pretestSetting.create({
    data: {
      pretestId: pretest.id,
      duration: 1800,
      countShownQuestions: 5,
    },
  });

  // Soal Pretest
  const pretestQuestionsData = [
    {
      pertanyaan: 'Apa pengertian dari algoritma?',
      options: [
        'Urutan langkah-langkah logis dan sistematis untuk menyelesaikan masalah',
        'Bahasa pemrograman tingkat tinggi',
        'Perangkat keras yang digunakan untuk komputasi',
        'Sistem operasi komputer',
      ],
      correctAnswerIdx: 0,
    },
    {
      pertanyaan:
        'Simbol apakah yang digunakan dalam flowchart untuk menunjukkan keputusan/kondisi?',
      options: [
        'Persegi panjang',
        'Belah ketupat',
        'Lingkaran',
        'Jajar genjang',
      ],
      correctAnswerIdx: 1,
    },
    {
      pertanyaan:
        'Struktur data yang menggunakan prinsip LIFO (Last In First Out) adalah...',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswerIdx: 1,
    },
    {
      pertanyaan: 'Apa kompleksitas waktu dari Binary Search?',
      options: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'],
      correctAnswerIdx: 3,
    },
    {
      pertanyaan: 'Manakah yang BUKAN termasuk aspek Computational Thinking?',
      options: [
        'Dekomposisi',
        'Pengenalan Pola',
        'Hardware Configuration',
        'Abstraksi',
      ],
      correctAnswerIdx: 2,
    },
  ];

  const allSoalPretest: { id: string; pretestId: string }[] = [];

  for (const q of pretestQuestionsData) {
    const soal = await prisma.soalPretest.create({
      data: {
        pretestId: pretest.id,
        pertanyaan: q.pertanyaan,
        correctAnswer: q.options[q.correctAnswerIdx],
        skor: 10,
      },
    });

    for (const option of q.options) {
      await prisma.pretestAnswerOptions.create({
        data: { soalPretestId: soal.id, option },
      });
    }

    allSoalPretest.push({ id: soal.id, pretestId: pretest.id });
  }
  console.log(` Pretest questions: ${allSoalPretest.length} records\n`);

  // =====================================================
  // POSTTEST + SETTINGS
  // =====================================================
  console.log('Creating Posttest...');

  const posttest = await prisma.posttest.create({ data: {} });

  await prisma.modul.update({
    where: { id: modul.id },
    data: { posttestId: posttest.id },
  });

  await prisma.posttestSetting.create({
    data: {
      posttestId: posttest.id,
      duration: 1,
      countShownQuestions: 5,
    },
  });

  const posttestQuestionsData = [
    {
      question: 'Langkah pertama dalam menyusun algoritma adalah...',
      pilihan: [
        'Mendefinisikan masalah',
        'Menulis kode program',
        'Menguji program',
        'Menginstal compiler',
      ],
      correctAnswer: 'Mendefinisikan masalah',
    },
    {
      question: 'Perbedaan utama antara while dan do-while adalah...',
      pilihan: [
        'While menjalankan minimal sekali, do-while bisa 0 kali',
        'Do-while menjalankan minimal sekali, while bisa 0 kali',
        'While lebih cepat dari do-while',
        'Tidak ada perbedaan',
      ],
      correctAnswer: 'Do-while menjalankan minimal sekali, while bisa 0 kali',
    },
    {
      question: 'Manakah yang merupakan contoh dekomposisi dalam CT?',
      pilihan: [
        'Membuat diagram alir',
        'Memecah aplikasi menjadi modul-modul kecil',
        'Mengulang pola yang sama',
        'Menyederhanakan detail kompleks',
      ],
      correctAnswer: 'Memecah aplikasi menjadi modul-modul kecil',
    },
    {
      question: 'Apa fungsi dari pseudocode?',
      pilihan: [
        'Menjalankan program secara langsung',
        'Menggambarkan logika algoritma dalam bahasa manusia',
        'Mengompilasi kode menjadi binary',
        'Mendesain tampilan aplikasi',
      ],
      correctAnswer: 'Menggambarkan logika algoritma dalam bahasa manusia',
    },
    {
      question:
        'Algoritma sorting yang memiliki kompleksitas rata-rata O(n log n) adalah...',
      pilihan: [
        'Bubble Sort',
        'Selection Sort',
        'Merge Sort',
        'Insertion Sort',
      ],
      correctAnswer: 'Merge Sort',
    },
  ];

  for (const q of posttestQuestionsData) {
    await prisma.soalPosttest.create({
      data: {
        posttestId: posttest.id,
        question: q.question,
        pilihan: q.pilihan,
        correctAnswer: q.correctAnswer,
        skor: 10,
      },
    });
  }
  console.log(` Posttest questions: ${posttestQuestionsData.length} records\n`);

  // =====================================================
  // TOPICS
  // =====================================================
  console.log('Creating Topics...');

  const topik1 = await prisma.topik.create({
    data: {
      nama: 'Pengantar Algoritma',
      modulId: modul.id,
      isComputationalThinking: false,
      rangkumanTopik:
        'Algoritma adalah urutan langkah logis untuk menyelesaikan masalah. Flowchart dan pseudocode adalah alat bantu untuk menggambarkan algoritma.',
    },
  });
  const topik2 = await prisma.topik.create({
    data: {
      nama: 'Dasar Computational Thinking',
      modulId: modul.id,
      isComputationalThinking: true,
      rangkumanTopik:
        'Computational Thinking mencakup 4 pilar: Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma. CT membantu memecahkan masalah kompleks secara sistematis.',
    },
  });
  console.log(` Topics: 2 records\n`);

  // =====================================================
  // MATERIALS
  // =====================================================
  console.log('Creating Materials...');

  const m1 = await prisma.materi.create({
    data: {
      tutorId: tutor.id,
      topikId: topik1.id,
      judul: 'Apa itu Algoritma?',
      isVideo: false,
      article:
        'Algoritma adalah sekumpulan langkah-langkah terstruktur dan terbatas yang digunakan untuk menyelesaikan suatu masalah. Setiap langkah harus jelas, logis, dan tidak ambigu. Contoh sederhana algoritma dalam kehidupan sehari-hari adalah resep masakan: ada urutan langkah yang harus diikuti dari awal hingga akhir.\n\nKarakteristik algoritma:\n1. Input: memiliki 0 atau lebih input\n2. Output: menghasilkan minimal 1 output\n3. Definiteness: setiap langkah harus jelas dan tidak ambigu\n4. Finiteness: harus berhenti setelah sejumlah langkah terbatas\n5. Effectiveness: setiap langkah dapat dikerjakan dalam waktu yang wajar',
    },
  });

  const m2 = await prisma.materi.create({
    data: {
      tutorId: tutor.id,
      topikId: topik1.id,
      judul: 'Flowchart & Pseudocode',
      isVideo: true,
      videoUrl: 'https://storage.example.com/video/flowchart-pseudocode.mp4',
      article: null,
    },
  });

  const m3 = await prisma.materi.create({
    data: {
      tutorId: tutor.id,
      topikId: topik2.id,
      judul: 'Konsep Computational Thinking',
      isVideo: false,
      article:
        'Computational Thinking (CT) adalah cara berpikir yang memungkinkan kita untuk memecahkan masalah kompleks dengan pendekatan yang terstruktur dan sistematis. CT terdiri dari 4 pilar utama:\n\n1. Dekomposisi (Decomposition): Memecah masalah besar menjadi bagian-bagian kecil yang lebih mudah dikelola.\n2. Pengenalan Pola (Pattern Recognition): Mengidentifikasi kesamaan dan pola dalam data atau masalah.\n3. Abstraksi (Abstraction): Menyaring informasi yang relevan dan mengabaikan detail yang tidak perlu.\n4. Perancangan Algoritma (Algorithm Design): Menyusun langkah-langkah solusi secara sistematis.\n\nCT bukan hanya tentang programming, tetapi merupakan skill yang dapat diterapkan di berbagai bidang seperti matematika, sains, dan kehidupan sehari-hari.',
    },
  });

  const m4 = await prisma.materi.create({
    data: {
      tutorId: tutor.id,
      topikId: topik2.id,
      judul: 'Contoh CT dalam Kehidupan Sehari-hari',
      isVideo: true,
      videoUrl: 'https://storage.example.com/video/ct-daily-life.mp4',
      article: null,
    },
  });

  const allMateri = [m1, m2, m3, m4];
  console.log(` Materials: ${allMateri.length} records\n`);

  // =====================================================
  // QUIZZES
  // =====================================================
  console.log('Creating Quizzes...');

  // Quiz 1: REGULER (Topik 1)
  const quiz1 = await prisma.quiz.create({
    data: {
      topikId: topik1.id,
      quizType: 'REGULER',
      question: 'Manakah yang BUKAN merupakan karakteristik algoritma?',
      correctAnswer: 'Hasil akhir selalu sama tidak peduli inputnya',
      skor: 10,
    },
  });

  const quiz1Options = [
    'Setiap langkah harus jelas dan tidak ambigu',
    'Harus berhenti setelah sejumlah langkah terbatas',
    'Hasil akhir selalu sama tidak peduli inputnya',
    'Menghasilkan minimal satu output',
  ];

  for (const option of quiz1Options) {
    await prisma.quizAnswerOption.create({
      data: { quizId: quiz1.id, option },
    });
  }

  await prisma.quizSetting.create({
    data: {
      quizId: quiz1.id,
      timeLimit: 60,
      allowMultipleAttempts: true,
      isComputationalThinkingEnabled: false,
      minScoreTreshold: 70,
      standardScorePerQuestion: 10,
    },
  });

  // Quiz 2: COMPUTATIONAL THINKING (Topik 2) — Soal cerita Dekomposisi
  const quiz2 = await prisma.quiz.create({
    data: {
      topikId: topik2.id,
      quizType: 'COMPUTATIONAL_THINKING',
      question:
        'Bu Dewi seorang pengusaha katering ingin mengembangkan usahanya. Ia menulis rencana: (1) riset pasar untuk mengetahui menu favorit pelanggan, (2) menentukan 10 menu andalan berdasarkan riset, (3) mencari 3 pemasok bahan baku terpercaya, (4) membuat jadwal produksi mingguan, (5) melatih 2 orang karyawan baru, (6) menentukan rute pengiriman yang efisien, (7) meluncurkan website pemesanan online.\n\nDengan membagi rencana pengembangan menjadi 7 langkah terpisah, Bu Dewi lebih mudah karena...',
      correctAnswer:
        'Setiap langkah memiliki fokus dan tujuan yang jelas sehingga bisa dikerjakan secara bertahap',
      skor: 10,
    },
  });

  const quiz2Options = [
    'Setiap langkah memiliki fokus dan tujuan yang jelas sehingga bisa dikerjakan secara bertahap',
    'Semua langkah harus diselesaikan dalam satu hari agar usaha cepat berkembang',
    'Karyawan baru bisa langsung bekerja tanpa perlu pelatihan terlebih dahulu',
    'Website pemesanan harus diluncurkan sebelum menentukan menu andalan',
  ];

  for (const option of quiz2Options) {
    await prisma.quizAnswerOption.create({
      data: { quizId: quiz2.id, option },
    });
  }

  await prisma.quizSetting.create({
    data: {
      quizId: quiz2.id,
      timeLimit: 120,
      allowMultipleAttempts: true,
      isComputationalThinkingEnabled: true,
      minScoreTreshold: 70,
      standardScorePerQuestion: 10,
    },
  });

  // Quiz 3: COMPUTATIONAL THINKING (Topik 2) — Soal cerita Pengenalan Pola
  const quiz3 = await prisma.quiz.create({
    data: {
      topikId: topik2.id,
      quizType: 'COMPUTATIONAL_THINKING',
      question:
        'Seorang kasir mencatat jumlah pengunjung toko setiap hari selama 4 minggu:\nMinggu 1: Sen(45), Sel(52), Rab(48), Kam(55), Jum(70), Sab(90)\nMinggu 2: Sen(42), Sel(50), Rab(45), Kam(58), Jum(75), Sab(95)\nMinggu 3: Sen(47), Sel(55), Rab(50), Kam(60), Jum(80), Sab(100)\nMinggu 4: Sen(43), Sel(48), Rab(52), Kam(57), Jum(72), Sab(92)\n\nBerdasarkan pola data tersebut, tindakan paling tepat untuk mengantisipasi lonjakan pengunjung adalah...',
      correctAnswer:
        'Menambah stok dan jumlah kasir di hari Jumat dan Sabtu karena akhir pekan selalu lebih ramai',
      skor: 10,
    },
  });

  const quiz3Options = [
    'Menambah stok dan jumlah kasir di hari Jumat dan Sabtu karena akhir pekan selalu lebih ramai',
    'Menutup toko di hari Senin karena pengunjung paling sedikit setiap minggunya',
    'Mengurangi jam buka toko di hari Selasa dan Rabu untuk menghemat biaya operasional',
    'Menambah cabang baru di lokasi berbeda karena data menunjukkan peningkatan pengunjung',
  ];

  for (const option of quiz3Options) {
    await prisma.quizAnswerOption.create({
      data: { quizId: quiz3.id, option },
    });
  }

  await prisma.quizSetting.create({
    data: {
      quizId: quiz3.id,
      timeLimit: 120,
      allowMultipleAttempts: true,
      isComputationalThinkingEnabled: true,
      minScoreTreshold: 70,
      standardScorePerQuestion: 10,
    },
  });

  // Quiz 4: COMPUTATIONAL THINKING (Topik 2) — Soal cerita Abstraksi
  const quiz4 = await prisma.quiz.create({
    data: {
      topikId: topik2.id,
      quizType: 'COMPUTATIONAL_THINKING',
      question:
        'Seorang developer diminta membuat fitur pencarian buku untuk perpustakaan yang memiliki 50.000 buku. Setiap buku memiliki 13 atribut data: ISBN, judul, penulis, penerbit, tahun terbit, jumlah halaman, genre, bahasa, nomor rak, status, rating, sinopsis, dan daftar isi.\n\nUntuk keperluan pencarian, developer hanya menggunakan 4 atribut: judul, penulis, genre, dan status. Atribut lainnya seperti sinopsis, daftar isi, dan jumlah halaman tidak digunakan dalam pencarian.\n\nMengapa developer mengambil keputusan tersebut?',
      correctAnswer:
        'Atribut sinopsis, daftar isi, dan jumlah halaman tidak relevan untuk menemukan buku berdasarkan judul atau penulis',
      skor: 10,
    },
  });

  const quiz4Options = [
    'Atribut sinopsis, daftar isi, dan jumlah halaman tidak relevan untuk menemukan buku berdasarkan judul atau penulis',
    'Database perpustakaan tidak menyimpan sinopsis dan daftar isi',
    'Proses pencarian akan berjalan lambat jika memproses terlalu banyak atribut',
    'Pengguna perpustakaan tidak pernah membaca sinopsis atau daftar isi buku',
  ];

  for (const option of quiz4Options) {
    await prisma.quizAnswerOption.create({
      data: { quizId: quiz4.id, option },
    });
  }

  await prisma.quizSetting.create({
    data: {
      quizId: quiz4.id,
      timeLimit: 120,
      allowMultipleAttempts: true,
      isComputationalThinkingEnabled: true,
      minScoreTreshold: 70,
      standardScorePerQuestion: 10,
    },
  });

  // Quiz 5: COMPUTATIONAL THINKING (Topik 2) — Soal cerita Perancangan Algoritma
  const quiz5 = await prisma.quiz.create({
    data: {
      topikId: topik2.id,
      quizType: 'COMPUTATIONAL_THINKING',
      question:
        'Seorang kurir harus mengirimkan 5 paket ke 5 alamat berbeda di satu kota. Ia menyusun langkah-langkah:\n(1) Catat kelima alamat tujuan\n(2) Urutkan alamat berdasarkan jarak dari kantor\n(3) Kunjungi alamat terdekat yang belum dikunjungi\n(4) Ulangi langkah (3) sampai semua paket terkirim\n(5) Kembali ke kantor\n\nKeuntungan utama dari menuliskan langkah berurutan seperti di atas adalah...',
      correctAnswer:
        'Kurir memiliki panduan kerja yang jelas dan prosedur yang konsisten dapat dijalankan setiap hari',
      skor: 10,
    },
  });

  const quiz5Options = [
    'Kurir memiliki panduan kerja yang jelas dan prosedur yang konsisten dapat dijalankan setiap hari',
    'Rute pengiriman yang dihasilkan selalu merupakan rute terpendek yang mungkin',
    'Kurir tidak perlu menghafal seluruh alamat tujuan pengiriman',
    'Paket dapat diantar tanpa menggunakan kendaraan karena alamat sudah diurutkan',
  ];

  for (const option of quiz5Options) {
    await prisma.quizAnswerOption.create({
      data: { quizId: quiz5.id, option },
    });
  }

  await prisma.quizSetting.create({
    data: {
      quizId: quiz5.id,
      timeLimit: 120,
      allowMultipleAttempts: true,
      isComputationalThinkingEnabled: true,
      minScoreTreshold: 70,
      standardScorePerQuestion: 10,
    },
  });

  console.log(' Quizzes: 5 records (1 REGULER, 4 COMPUTATIONAL_THINKING)\n');

  // =====================================================
  // QUIZ GROUPS
  // =====================================================
  console.log('Creating Quiz Groups...');

  // Quiz Group 1: REGULER (Topik 1)
  const quizGroup1 = await prisma.quizGroup.create({
    data: {
      topikId: topik1.id,
      nama: 'Kuis Algoritma Dasar',
      quizType: 'REGULER',
    },
  });
  await prisma.quiz.update({
    where: { id: quiz1.id },
    data: { quizGroupId: quizGroup1.id },
  });

  // Quiz Group 2: COMPUTATIONAL THINKING (Topik 2) — groups quiz2, quiz3, quiz4, quiz5
  const quizGroup2 = await prisma.quizGroup.create({
    data: {
      topikId: topik2.id,
      nama: 'Kuis Computational Thinking',
      quizType: 'COMPUTATIONAL_THINKING',
    },
  });
  await prisma.quiz.update({
    where: { id: quiz2.id },
    data: { quizGroupId: quizGroup2.id },
  });
  await prisma.quiz.update({
    where: { id: quiz3.id },
    data: { quizGroupId: quizGroup2.id },
  });
  await prisma.quiz.update({
    where: { id: quiz4.id },
    data: { quizGroupId: quizGroup2.id },
  });
  await prisma.quiz.update({
    where: { id: quiz5.id },
    data: { quizGroupId: quizGroup2.id },
  });

  // =====================================================
  // TOPIK ITEMS
  // =====================================================
  console.log('Creating Topik Items...');

  await prisma.topikItem.create({
    data: {
      topikId: topik1.id,
      itemId: m1.id,
      orderNumber: 1,
      itemType: 'MATERI',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik1.id,
      itemId: m2.id,
      orderNumber: 2,
      itemType: 'MATERI',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: m3.id,
      orderNumber: 1,
      itemType: 'MATERI',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: m4.id,
      orderNumber: 2,
      itemType: 'MATERI',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik1.id,
      itemId: quiz1.id,
      orderNumber: 3,
      itemType: 'QUIZ',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: quiz2.id,
      orderNumber: 3,
      itemType: 'QUIZ',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: quiz3.id,
      orderNumber: 4,
      itemType: 'QUIZ',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: quiz4.id,
      orderNumber: 5,
      itemType: 'QUIZ',
    },
  });
  await prisma.topikItem.create({
    data: {
      topikId: topik2.id,
      itemId: quiz5.id,
      orderNumber: 6,
      itemType: 'QUIZ',
    },
  });
  console.log(' Topik Items: 9 records\n');

  // =====================================================
  // KNOWLEDGE COMPONENTS
  // =====================================================
  console.log('Creating Knowledge Components...');

  const kc1 = await prisma.knowledgeComponent.create({
    data: {
      modulId: modul.id,
      code: 'algoritma_dasar',
      nama: 'Algoritma Dasar',
      deskripsi:
        'Pemahaman tentang konsep dasar algoritma, flowchart, dan pseudocode.',
    },
  });

  const kc2 = await prisma.knowledgeComponent.create({
    data: {
      modulId: modul.id,
      code: 'ct_skills',
      nama: 'Computational Thinking Skills',
      deskripsi:
        'Kemampuan menerapkan dekomposisi, pengenalan pola, abstraksi, dan perancangan algoritma.',
    },
  });

  const allKc = [kc1, kc2];
  console.log(` Knowledge Components: ${allKc.length} records\n`);

  // =====================================================
  // PRETEST QUESTION SKILL MAP
  // =====================================================
  console.log('Creating Pretest Question Skill Maps...');

  // Map soal 0-3 ke kc1 (algoritma_dasar), soal 4 ke kc2 (ct_skills)
  for (let i = 0; i < allSoalPretest.length; i++) {
    const kc = i < 4 ? kc1 : kc2;
    await prisma.pretestQuestionSkillMap.create({
      data: {
        pretestQuestionId: allSoalPretest[i].id,
        knowledgeComponentId: kc.id,
        weight: 1.0,
      },
    });
  }
  console.log(` PretestQuestionSkillMap: ${allSoalPretest.length} records\n`);

  // =====================================================
  // PROGRESS (Student enrolled + completed)
  // =====================================================
  console.log('Creating Progress...');

  const completedContentItems = JSON.stringify([
    {
      itemId: 'pretest',
      itemType: 'PRETEST',
      completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      itemId: m1.id,
      itemType: 'MATERI',
      completedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      itemId: m2.id,
      itemType: 'MATERI',
      completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      itemId: quiz1.id,
      itemType: 'QUIZ',
      completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      itemId: m3.id,
      itemType: 'MATERI',
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      itemId: m4.id,
      itemType: 'MATERI',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      itemId: quiz2.id,
      itemType: 'QUIZ',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      itemId: quiz3.id,
      itemType: 'QUIZ',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      itemId: quiz4.id,
      itemType: 'QUIZ',
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      itemId: quiz5.id,
      itemType: 'QUIZ',
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      itemId: 'posttest',
      itemType: 'POSTTEST',
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      itemId: 'rating',
      itemType: 'RATING',
      completedAt: new Date(Date.now()).toISOString(),
    },
  ]);

  const pretestAssignedQuestions = JSON.stringify(
    allSoalPretest.map((s) => s.id),
  );
  const posttestAssignedQuestions = JSON.stringify(
    (
      await prisma.soalPosttest.findMany({
        where: { posttestId: posttest.id },
        select: { id: true },
      })
    ).map((s) => s.id),
  );

  const progress = await prisma.progress.create({
    data: {
      siswaId: siswa.id,
      modulId: modul.id,
      status: 'COMPLETED',
      isGraduated: true,
      progressPercentage: 100,
      finalScore: 90,
      pretestScore: 40,
      pretestCorrectCount: 4,
      pretestWrongCount: 1,
      pretestTimeSpent: 600,
      pretestCompleted: true,
      posttestScore: 50,
      posttestCorrectCount: 5,
      posttestWrongCount: 0,
      posttestTimeSpent: 900,
      posttestCompleted: true,
      completedContentItems,
      pretestAssignedQuestions,
      posttestAssignedQuestions,
    },
  });
  console.log(' Progress: 1 record (COMPLETED)\n');

  // =====================================================
  // QUIZ SCORES
  // =====================================================
  console.log('Creating Quiz Scores...');

  await prisma.quizScore.create({
    data: {
      progressId: progress.id,
      score: 10,
      quizType: 'QUIZ',
      questionId: quiz1.id,
      answeredAt: new Date(Date.now() - 4 * 86400000),
    },
  });

  await prisma.quizScore.create({
    data: {
      progressId: progress.id,
      score: 10,
      quizType: 'QUIZ',
      questionId: quiz2.id,
      answeredAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.quizScore.create({
    data: {
      progressId: progress.id,
      score: 10,
      quizType: 'QUIZ',
      questionId: quiz3.id,
      answeredAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.quizScore.create({
    data: {
      progressId: progress.id,
      score: 10,
      quizType: 'QUIZ',
      questionId: quiz4.id,
      answeredAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.quizScore.create({
    data: {
      progressId: progress.id,
      score: 10,
      quizType: 'QUIZ',
      questionId: quiz5.id,
      answeredAt: new Date(Date.now() - 1 * 86400000),
    },
  });
  console.log(' Quiz Scores: 5 records\n');

  // =====================================================
  // CERTIFICATE
  // =====================================================
  console.log('Creating Certificate...');

  const kodeSertif = `CERT-FINAL-${Date.now().toString().slice(-6)}`;

  await prisma.certificate.create({
    data: {
      siswaId: siswa.id,
      modulId: modul.id,
      kode_sertif: kodeSertif,
      certificateUrl: `https://storage.example.com/certificates/${kodeSertif}.pdf`,
      issued_at: new Date(),
    },
  });
  console.log(` Certificate: ${kodeSertif}\n`);

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('========================================');
  console.log('  SEEDING COMPLETE');
  console.log('========================================\n');
  console.log('Login credentials:');
  console.log(`  Admin: ${TEST_EMAILS.admin} / admin123`);
  console.log(`  Tutor: ${TEST_EMAILS.tutor} / tutor123`);
  console.log(`  Siswa: ${TEST_EMAILS.siswa} / siswa123\n`);
  console.log('Module:');
  console.log(`  ${modul.moduleName}`);
  console.log(`  Status: GRATIS | Bersertifikat | Published\n`);
  console.log('Data created:');
  console.log(`  - ${allSoalPretest.length} pretest questions`);
  console.log(`  - ${posttestQuestionsData.length} posttest questions`);
  console.log(`  - ${allMateri.length} materials`);
  console.log(`  - 5 quizzes (1 REGULER, 4 COMPUTATIONAL_THINKING)`);
  console.log(`  - ${ctAspects.length} CT aspects`);
  console.log(`  - ${allKc.length} knowledge components`);
  console.log(`  - 1 siswa enrolled (COMPLETED)`);
  console.log(`  - 1 certificate issued\n`);
  console.log('Run with: npx tsx prisma/finalseed.ts');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());