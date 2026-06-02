import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
  console.log('Seeding database...\n');

  // =====================================================
  // 1. ADMIN (1 record)
  // =====================================================
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@lms.test' },
    update: {},
    create: {
      email: 'admin@lms.test',
      password: adminPassword,
      username: 'admin_utama',
      fullName: 'Admin Utama',
      gender: 'Laki-laki',
      whatsappNumber: '081234567890',
      role: 'admin',
    },
  });
  console.log(`1. Admin: ${admin.id}`);

  // =====================================================
  // 2. TUTOR (10 records)
  // =====================================================
  const tutorPassword = await hashPassword('tutor123');
  const tutorData = [
    {
      fullName: 'Dr. Budi Santoso',
      email: 'tutor1@lms.test',
      gender: 'L',
      pekerjaan: 'Dosen Informatika',
      whatsappNumber: '628111111111',
      lastEducation: 'S3 Ilmu Komputer',
      institution: 'Universitas Indonesia',
      prodi: 'Ilmu Komputer',
      cvPathUrl: 'https://storage.example.com/cv/budi.pdf',
      biografi:
        'Dosen dengan pengalaman 15 tahun di bidang algoritma dan struktur data.',
    },
    {
      fullName: 'Siti Rahmawati M.Pd',
      email: 'tutor2@lms.test',
      gender: 'P',
      pekerjaan: 'Guru Matematika',
      whatsappNumber: '628111111112',
      lastEducation: 'S2 Pendidikan Matematika',
      institution: 'SMA Negeri 1 Jakarta',
      prodi: 'Pendidikan Matematika',
      cvPathUrl: 'https://storage.example.com/cv/siti.pdf',
      biografi:
        'Guru matematika berpengalaman dengan metode pengajaran interaktif.',
    },
    {
      fullName: 'Ahmad Zainuddin',
      email: 'tutor3@lms.test',
      gender: 'L',
      pekerjaan: 'Software Engineer',
      whatsappNumber: '628111111113',
      lastEducation: 'S1 Teknik Informatika',
      institution: 'PT Teknologi Maju',
      prodi: 'Rekayasa Perangkat Lunak',
      cvPathUrl: 'https://storage.example.com/cv/ahmad.pdf',
      biografi:
        'Praktisi industri dengan pengalaman 8 tahun di pengembangan web.',
    },
    {
      fullName: 'Dian Permata Sari',
      email: 'tutor4@lms.test',
      gender: 'P',
      pekerjaan: 'Dosen Sistem Informasi',
      whatsappNumber: '628111111114',
      lastEducation: 'S2 Sistem Informasi',
      institution: 'Institut Teknologi Bandung',
      prodi: 'Sistem Informasi',
      cvPathUrl: 'https://storage.example.com/cv/dian.pdf',
      biografi: 'Mengajar basis data dan analisis sistem sejak 2012.',
    },
    {
      fullName: 'Rudi Haryanto',
      email: 'tutor5@lms.test',
      gender: 'L',
      pekerjaan: 'Trainer IT',
      whatsappNumber: '628111111115',
      lastEducation: 'S1 Ilmu Komputer',
      institution: 'Lembaga Pelatihan Koding',
      prodi: 'Pengembangan Aplikasi',
      cvPathUrl: 'https://storage.example.com/cv/rudi.pdf',
      biografi:
        'Trainer IT bersertifikasi internasional di bidang jaringan dan keamanan.',
    },
    {
      fullName: 'Maya Anggraini',
      email: 'tutor6@lms.test',
      gender: 'P',
      pekerjaan: 'Guru IPA',
      whatsappNumber: '628111111116',
      lastEducation: 'S2 Pendidikan Sains',
      institution: 'SMP Negeri 5 Surabaya',
      prodi: 'Pendidikan Sains',
      cvPathUrl: 'https://storage.example.com/cv/maya.pdf',
      biografi:
        'Guru IPA yang aktif mengintegrasikan teknologi dalam pembelajaran.',
    },
    {
      fullName: 'Hendra Gunawan',
      email: 'tutor7@lms.test',
      gender: 'L',
      pekerjaan: 'Data Scientist',
      whatsappNumber: '628111111117',
      lastEducation: 'S2 Data Science',
      institution: 'GoTo Financial',
      prodi: 'Data Science',
      cvPathUrl: 'https://storage.example.com/cv/hendra.pdf',
      biografi: 'Data scientist dengan spesialisasi machine learning dan AI.',
    },
    {
      fullName: 'Fitri Handayani',
      email: 'tutor8@lms.test',
      gender: 'P',
      pekerjaan: 'Widyaiswara',
      whatsappNumber: '628111111118',
      lastEducation: 'S2 Teknologi Pendidikan',
      institution: 'Pusdiklat Kemendikbud',
      prodi: 'Teknologi Pendidikan',
      cvPathUrl: 'https://storage.example.com/cv/fitri.pdf',
      biografi:
        'Widyaiswara yang fokus pada pengembangan media pembelajaran digital.',
    },
    {
      fullName: 'Agus Prasetyo',
      email: 'tutor9@lms.test',
      gender: 'L',
      pekerjaan: 'Full Stack Developer',
      whatsappNumber: '628111111119',
      lastEducation: 'S1 Teknik Komputer',
      institution: 'Startup EduTech',
      prodi: 'Pengembangan Web Full Stack',
      cvPathUrl: 'https://storage.example.com/cv/agus.pdf',
      biografi: 'Full stack developer yang aktif menulis tutorial pemrograman.',
    },
    {
      fullName: 'Rina Marlina',
      email: 'tutor10@lms.test',
      gender: 'P',
      pekerjaan: 'Dosen Statistika',
      whatsappNumber: '628111111120',
      lastEducation: 'S3 Statistika',
      institution: 'Universitas Gadjah Mada',
      prodi: 'Statistika',
      cvPathUrl: 'https://storage.example.com/cv/rina.pdf',
      biografi:
        'Dosen statistika dengan publikasi internasional di bidang analisis data.',
    },
  ];

  const tutors = await Promise.all(
    tutorData.map((t) =>
      prisma.tutor.upsert({
        where: { email: t.email },
        update: {},
        create: { ...t, password: tutorPassword, role: 'tutor' },
      }),
    ),
  );
  console.log(`2. Tutor: ${tutors.length} records`);

  // =====================================================
  // 3. SOCIAL MEDIA (2 per tutor = 20 records)
  // =====================================================
  await Promise.all(
    tutors.flatMap((t) => [
      prisma.socialMedia.create({
        data: {
          tutorId: t.id,
          platform: 'Instagram',
          url: `https://instagram.com/${t.fullName.toLowerCase().replace(/\s+/g, '')}`,
        },
      }),
      prisma.socialMedia.create({
        data: {
          tutorId: t.id,
          platform: 'LinkedIn',
          url: `https://linkedin.com/in/${t.fullName.toLowerCase().replace(/\s+/g, '')}`,
        },
      }),
    ]),
  );
  console.log('3. SocialMedia: 20 records');

  // =====================================================
  // 4. SIGNATURE (1 per tutor = 10 records)
  // =====================================================
  await Promise.all(
    tutors.map((t) =>
      prisma.signature.create({
        data: {
          tutorId: t.id,
          fileUrl: `https://storage.example.com/signature/${t.id}.png`,
        },
      }),
    ),
  );
  console.log('4. Signature: 10 records');

  // =====================================================
  // 5. SISWA (10 records)
  // =====================================================
  const siswaPassword = await hashPassword('siswa123');
  const siswaData = [
    {
      nama_lengkap: 'Ahmad Fauzi',
      email: 'siswa1@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: '11 IPA 1',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Dewi Lestari',
      email: 'siswa2@lms.test',
      jenjang: 'SMP',
      kelas_sekolah: '8A',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Rizky Pratama',
      email: 'siswa3@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: '12 IPA 2',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Sari Indah',
      email: 'siswa4@lms.test',
      jenjang: 'SD',
      kelas_sekolah: '6A',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Bayu Nugroho',
      email: 'siswa5@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: '10 IPS 1',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Citra Ayu',
      email: 'siswa6@lms.test',
      jenjang: 'SMP',
      kelas_sekolah: '7B',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Dimas Ardiansyah',
      email: 'siswa7@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: '11 IPA 3',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Fitria Ananda',
      email: 'siswa8@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: '12 IPS 1',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Gilang Permadi',
      email: 'siswa9@lms.test',
      jenjang: 'SMP',
      kelas_sekolah: '9A',
      studentType: 'SISWA' as const,
    },
    {
      nama_lengkap: 'Hana Safira',
      email: 'siswa10@lms.test',
      jenjang: 'SD',
      kelas_sekolah: '5B',
      studentType: 'SISWA' as const,
    },
  ];

  const siswas = await Promise.all(
    siswaData.map((s) =>
      prisma.siswa.upsert({
        where: { email: s.email },
        update: {},
        create: { ...s, password: siswaPassword, role: 'siswa' },
      }),
    ),
  );
  console.log(`5. Siswa: ${siswas.length} records`);

  // =====================================================
  // 6. UMUM (3 records, disimpan di tabel siswa)
  // =====================================================
  const umumPassword = await hashPassword('umum123');
  const umumData = [
    {
      nama_lengkap: 'Bambang Suprapto',
      email: 'umum1@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'GURU' as const,
    },
    {
      nama_lengkap: 'Kartika Wijaya',
      email: 'umum2@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'GURU' as const,
    },
    {
      nama_lengkap: 'Eko Prasetyo',
      email: 'umum3@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'GURU' as const,
    },
  ];

  const umumUsers = await Promise.all(
    umumData.map((u) =>
      prisma.siswa.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, password: umumPassword, role: 'umum' },
      }),
    ),
  );
  console.log(`6. Umum: ${umumUsers.length} records`);

  // =====================================================
  // 7. MODUL (10 records)
  // =====================================================
  const modulData = [
    {
      moduleName: 'Algoritma Dasar',
      subtitle: 'Pengantar logika dan algoritma',
      description:
        'Materi fundamental tentang konsep algoritma, flowchart, dan pseudocode untuk pemula.',
      targetTime: 120,
      difficulty: 'Beginner',
      isPaid: false,
      level: 'SMA',
      class: '10',
      modulType: 'SISWA' as const,
      tutorIdx: 0,
      isDraft: false,
    },
    {
      moduleName: 'Struktur Data',
      subtitle: 'Array, Linked List, Stack & Queue',
      description:
        'Pembahasan mendalam tentang struktur data dasar dalam ilmu komputer.',
      targetTime: 180,
      difficulty: 'Intermediate',
      isPaid: true,
      modulPrice: 50000,
      level: 'SMA',
      class: '11',
      modulType: 'SISWA' as const,
      tutorIdx: 0,
      isDraft: false,
    },
    {
      moduleName: 'Pemrograman Web Dasar',
      subtitle: 'HTML, CSS, JavaScript',
      description:
        'Belajar membangun website dari nol dengan teknologi web fundamental.',
      targetTime: 240,
      difficulty: 'Beginner',
      isPaid: false,
      level: 'SMA',
      class: '10',
      modulType: 'SISWA' as const,
      tutorIdx: 1,
      isDraft: false,
    },
    {
      moduleName: 'Basis Data Relasional',
      subtitle: 'SQL & Perancangan Database',
      description:
        'Mempelajari konsep basis data relasional, SQL query, dan normalisasi.',
      targetTime: 150,
      difficulty: 'Intermediate',
      isPaid: true,
      modulPrice: 75000,
      level: 'SMA',
      class: '11',
      modulType: 'SISWA' as const,
      tutorIdx: 2,
      isDraft: false,
    },
    {
      moduleName: 'Pengantar Coding untuk Guru',
      subtitle: 'Dasar pemrograman untuk pengajar',
      description:
        'Modul khusus untuk guru yang ingin belajar coding dari dasar.',
      targetTime: 120,
      difficulty: 'Beginner',
      isPaid: false,
      modulType: 'UMUM' as const,
      tutorIdx: 3,
      isDraft: true,
    },
    {
      moduleName: 'Matematika Diskrit',
      subtitle: 'Logika, himpunan, dan relasi',
      description: 'Konsep matematika yang mendasari ilmu komputer.',
      targetTime: 200,
      difficulty: 'Advanced',
      isPaid: true,
      modulPrice: 100000,
      level: 'SMA',
      class: '12',
      modulType: 'SISWA' as const,
      tutorIdx: 4,
      isDraft: false,
    },
    {
      moduleName: 'Machine Learning Dasar',
      subtitle: 'Pengantar AI dan ML',
      description: 'Pengenalan konsep machine learning menggunakan Python.',
      targetTime: 300,
      difficulty: 'Advanced',
      isPaid: true,
      modulPrice: 150000,
      level: 'SMA',
      class: '12',
      modulType: 'SISWA' as const,
      tutorIdx: 6,
      isDraft: false,
    },
    {
      moduleName: 'Jaringan Komputer',
      subtitle: 'Dasar-dasar networking',
      description:
        'Mempelajari konsep jaringan komputer, TCP/IP, dan keamanan jaringan.',
      targetTime: 180,
      difficulty: 'Intermediate',
      isPaid: false,
      level: 'SMA',
      class: '11',
      modulType: 'SISWA' as const,
      tutorIdx: 4,
      isDraft: false,
    },
    {
      moduleName: 'Media Pembelajaran Digital',
      subtitle: 'Membuat konten ajar interaktif',
      description:
        'Panduan membuat media pembelajaran digital untuk para pendidik.',
      targetTime: 90,
      difficulty: 'Beginner',
      isPaid: false,
      modulType: 'UMUM' as const,
      tutorIdx: 7,
      isDraft: false,
    },
    {
      moduleName: 'Statistika untuk Penelitian',
      subtitle: 'Analisis data penelitian',
      description:
        'Teknik statistika yang sering digunakan dalam penelitian pendidikan.',
      targetTime: 210,
      difficulty: 'Intermediate',
      isPaid: true,
      modulPrice: 80000,
      modulType: 'UMUM' as const,
      tutorIdx: 9,
      isDraft: false,
    },
  ];

  const moduls = await Promise.all(
    modulData.map((m) =>
      prisma.modul.create({
        data: {
          moduleName: m.moduleName,
          subtitle: m.subtitle,
          description: m.description,
          targetTime: m.targetTime,
          difficulty: m.difficulty,
          isPaid: m.isPaid ?? false,
          modulPrice: (m as any).modulPrice ?? null,
          level: (m as any).level ?? null,
          class: (m as any).class ?? null,
          modulType: m.modulType,
          tutorId: tutors[m.tutorIdx].id,
          isDraft: m.isDraft ?? false,
        },
      }),
    ),
  );
  console.log(`7. Modul: ${moduls.length} records`);

  // =====================================================
  // 8. PRETEST (5 records)
  // =====================================================
  const pretests = await Promise.all(
    moduls.slice(0, 5).map((m) =>
      prisma.pretest.create({
        data: { pretestName: `Pretest ${m.moduleName}` },
      }),
    ),
  );

  // Hubungkan pretest ke modul
  for (let i = 0; i < pretests.length; i++) {
    await prisma.modul.update({
      where: { id: moduls[i].id },
      data: { pretestId: pretests[i].id },
    });
  }
  console.log(`8. Pretest: ${pretests.length} records`);

  // =====================================================
  // 9. POSTTEST (5 records)
  // =====================================================
  const posttests = await Promise.all(
    moduls.slice(0, 5).map((m) => prisma.posttest.create({ data: {} })),
  );

  for (let i = 0; i < posttests.length; i++) {
    await prisma.modul.update({
      where: { id: moduls[i].id },
      data: { posttestId: posttests[i].id },
    });
  }
  console.log(`9. Posttest: ${posttests.length} records`);

  // =====================================================
  // 10. SOAL PRETEST (4 per pretest = 20 records)
  // =====================================================
  const pretestQuestions = [
    {
      pertanyaan: 'Apa itu algoritma?',
      options: [
        'Urutan langkah sistematis',
        'Kumpulan kode program',
        'Bahasa pemrograman',
        'Perangkat keras komputer',
      ],
      correctAnswerIdx: 0,
      skor: 10,
    },
    {
      pertanyaan: 'Simbol flowchart untuk proses adalah...',
      options: [
        'Lingkaran',
        'Persegi panjang',
        'Belah ketupat',
        'Jajar genjang',
      ],
      correctAnswerIdx: 1,
      skor: 10,
    },
    {
      pertanyaan: 'Struktur data LIFO adalah...',
      options: [
        'Queue',
        'Array',
        'Stack',
        'Linked List',
      ],
      correctAnswerIdx: 2,
      skor: 10,
    },
    {
      pertanyaan: 'Kompleksitas Binary Search adalah...',
      options: [
        'O(n)',
        'O(n\u00B2)',
        'O(1)',
        'O(log n)',
      ],
      correctAnswerIdx: 3,
      skor: 10,
    },
  ];
  const allSoalPretest: { id: string; pretestId: string }[] = [];

  for (const pt of pretests) {
    for (const q of pretestQuestions) {
      const soal = await prisma.soalPretest.create({
        data: {
          pretestId: pt.id,
          pertanyaan: q.pertanyaan,
          correctAnswer: q.options[q.correctAnswerIdx],
          skor: q.skor,
        },
      });

      await Promise.all(
        q.options.map((option) =>
          prisma.pretestAnswerOptions.create({
            data: { soalPretestId: soal.id, option },
          }),
        ),
      );

      allSoalPretest.push({ id: soal.id, pretestId: pt.id });
    }
  }
  console.log(`10. SoalPretest: ${allSoalPretest.length} records (80 answer options)`);

  // =====================================================
  // 12. PRETEST SETTING (1 per pretest = 5 records)
  // =====================================================
  for (const pt of pretests) {
    await prisma.pretestSetting.create({
      data: { pretestId: pt.id, duration: 1800, countShownQuestions: 10 },
    });
  }
  console.log('12. PretestSetting: 5 records');

  // =====================================================
  // 13. SOAL POSTTEST (4 per posttest = 20 records)
  // =====================================================
  const posttestQuestions = [
    {
      question: 'Sebutkan jenis looping dalam pemrograman?',
      pilihan: [
        'For, While, Do-While',
        'If, Else, Switch',
        'Array, Object, Function',
        'GET, POST, PUT',
      ],
      correctAnswer: 'For, While, Do-While',
      skor: 10,
    },
    {
      question: 'Apa fungsi dari primary key?',
      pilihan: [
        'Unik mengidentifikasi record',
        'Menyimpan data besar',
        'Menghubungkan ke internet',
        'Mengenkripsi data',
      ],
      correctAnswer: 'Unik mengidentifikasi record',
      skor: 10,
    },
    {
      question: 'Protokol yang digunakan web adalah...',
      pilihan: ['HTTP/HTTPS', 'FTP', 'SMTP', 'SSH'],
      correctAnswer: 'HTTP/HTTPS',
      skor: 10,
    },
    {
      question: 'Apa itu variable dalam pemrograman?',
      pilihan: [
        'Tempat menyimpan data',
        'Jenis data',
        'Nama fungsi',
        'Struktur perulangan',
      ],
      correctAnswer: 'Tempat menyimpan data',
      skor: 10,
    },
  ];

  for (const pt of posttests) {
    for (const q of posttestQuestions) {
      await prisma.soalPosttest.create({
        data: {
          posttestId: pt.id,
          question: q.question,
          pilihan: q.pilihan,
          correctAnswer: q.correctAnswer,
          skor: q.skor,
        },
      });
    }
  }
  console.log('13. SoalPosttest: 20 records');

  // =====================================================
  // 14. TOPIK (2 per modul = 20 records)
  // =====================================================
  const topikNames = [
    ['Apa itu Algoritma', 'Flowchart & Pseudocode'],
    ['Konsep Array', 'Linked List'],
    ['HTML Dasar', 'CSS & Layout'],
    ['SQL Query', 'Normalisasi Database'],
    ['Pengenalan Coding', 'Logika Dasar'],
    ['Logika Matematika', 'Himpunan & Relasi'],
    ['Supervised Learning', 'Unsupervised Learning'],
    ['OSI Layer', 'TCP/IP Protocol'],
    ['Membuat Video Pembelajaran', 'Membuat Kuis Interaktif'],
    ['Statistika Deskriptif', 'Uji Hipotesis'],
  ];

  const topiks: { id: string; modulId: string }[] = [];
  for (let i = 0; i < moduls.length; i++) {
    for (const nama of topikNames[i]) {
      const topik = await prisma.topik.create({
        data: { nama, modulId: moduls[i].id },
      });
      topiks.push({ id: topik.id, modulId: topik.modulId });
    }
  }
  console.log(`14. Topik: ${topiks.length} records`);

  // =====================================================
  // 15. MATERI (2 per topik = 40 records)
  // =====================================================
  const materis: { id: string; topikId: string }[] = [];
  for (const topik of topiks) {
    const m1 = await prisma.materi.create({
      data: {
        tutorId: tutors[0].id,
        topikId: topik.id,
        isVideo: false,
        article: `Artikel pembelajaran untuk topik ini. Berisi penjelasan lengkap dan contoh-contoh yang mudah dipahami oleh siswa.`,
      },
    });
    materis.push({ id: m1.id, topikId: topik.id });

    const m2 = await prisma.materi.create({
      data: {
        tutorId: tutors[1].id,
        topikId: topik.id,
        isVideo: true,
        videoUrl: `https://storage.example.com/video/${topik.id}.mp4`,
      },
    });
    materis.push({ id: m2.id, topikId: topik.id });
  }
  console.log(`15. Materi: ${materis.length} records`);

  // =====================================================
  // 16. SUBMATERI (2 per materi = 80 records)
  // =====================================================
  let submateriCount = 0;
  for (const materi of materis) {
    await prisma.submateri.create({
      data: {
        materiId: materi.id,
        judul: `Submateri 1 - ${materi.id.slice(0, 6)}`,
        konten:
          'Konten detail untuk submateri pertama. Berisi penjelasan dan ilustrasi.',
      },
    });
    await prisma.submateri.create({
      data: {
        materiId: materi.id,
        judul: `Submateri 2 - ${materi.id.slice(0, 6)}`,
        konten:
          'Konten detail untuk submateri kedua. Berisi latihan dan studi kasus.',
      },
    });
    submateriCount += 2;
  }
  console.log(`16. Submateri: ${submateriCount} records`);

  // =====================================================
  // 17. TOPIK ITEM (1 per materi = 40 records)
  // =====================================================
  for (let i = 0; i < materis.length; i++) {
    await prisma.topikItem.create({
      data: {
        topikId: materis[i].topikId,
        itemId: materis[i].id,
        orderNumber: (i % 2) + 1,
        itemType: i % 2 === 0 ? 'ARTICLE' : 'QUIZ',
      },
    });
  }
  console.log('17. TopikItem: 40 records');

  // =====================================================
  // 18. QUIZ (1 per modul = 10 records)
  // =====================================================
  const quizQuestions = [
    {
      question: 'Apa langkah pertama dalam menyusun algoritma?',
      options: [
        'Mendefinisikan masalah',
        'Menulis kode program',
        'Menguji program',
        'Menginstal compiler',
      ],
      correctAnswer: 'Mendefinisikan masalah',
      skor: 10,
    },
    {
      question: 'Struktur data yang menggunakan prinsip LIFO adalah...',
      options: [
        'Queue',
        'Stack',
        'Array',
        'Tree',
      ],
      correctAnswer: 'Stack',
      skor: 10,
    },
    {
      question: 'Tag HTML untuk membuat heading terbesar adalah...',
      options: [
        '<heading>',
        '<h6>',
        '<h1>',
        '<head>',
      ],
      correctAnswer: '<h1>',
      skor: 10,
    },
    {
      question: 'Perintah SQL untuk mengambil data dari tabel adalah...',
      options: [
        'INSERT',
        'UPDATE',
        'DELETE',
        'SELECT',
      ],
      correctAnswer: 'SELECT',
      skor: 10,
    },
    {
      question: 'Apa kepanjangan dari IDE?',
      options: [
        'Integrated Development Environment',
        'Internet Data Exchange',
        'Internal Design Engine',
        'Integrated Debugging Engine',
      ],
      correctAnswer: 'Integrated Development Environment',
      skor: 10,
    },
    {
      question: 'Himpunan kosong dilambangkan dengan...',
      options: [
        '{0}',
        '{}',
        '\u2205',
        'None',
      ],
      correctAnswer: '\u2205',
      skor: 10,
    },
    {
      question: 'Algoritma Machine Learning untuk prediksi nilai kontinu adalah...',
      options: [
        'Klasifikasi',
        'Regresi',
        'Clustering',
        'Asosiasi',
      ],
      correctAnswer: 'Regresi',
      skor: 10,
    },
    {
      question: 'Protokol yang digunakan untuk mengirim email adalah...',
      options: [
        'HTTP',
        'FTP',
        'SMTP',
        'SSH',
      ],
      correctAnswer: 'SMTP',
      skor: 10,
    },
    {
      question: 'Aplikasi untuk membuat presentasi interaktif adalah...',
      options: [
        'Microsoft Word',
        'Microsoft Excel',
        'Microsoft PowerPoint',
        'Microsoft OneNote',
      ],
      correctAnswer: 'Microsoft PowerPoint',
      skor: 10,
    },
    {
      question: 'Ukuran pemusatan data yang paling sering muncul disebut...',
      options: [
        'Mean',
        'Median',
        'Modus',
        'Range',
      ],
      correctAnswer: 'Modus',
      skor: 10,
    },
  ];

  const quizzes: { id: string }[] = [];
  for (let i = 0; i < moduls.length; i++) {
    const modulMateris = materis.filter((m) => {
      const topik = topiks.find((t) => t.id === m.topikId);
      return topik && topik.modulId === moduls[i].id;
    });
    if (modulMateris.length > 0) {
      const q = quizQuestions[i];
      const quiz = await prisma.quiz.create({
        data: {
          materiId: modulMateris[0].id,
          question: q.question,
          correctAnswer: q.correctAnswer,
          skor: q.skor,
        },
      });

      await Promise.all(
        q.options.map((option) =>
          prisma.quizAnswerOption.create({
            data: { quizId: quiz.id, option },
          }),
        ),
      );

      quizzes.push(quiz);
    }
  }
  console.log(`18. Quiz: ${quizzes.length} records (40 answer options)`);

  // =====================================================
  // 20. QUIZ SETTING (1 per quiz = 10 records)
  // =====================================================
  for (const quiz of quizzes) {
    await prisma.quizSetting.create({
      data: {
        quizId: quiz.id,
        timeLimit: 60,
        allowMultipleAttempts: true,
        minScoreTreshold: 70,
        standardScorePerQuestion: 10,
      },
    });
  }
  console.log('20. QuizSetting: 10 records');

  // =====================================================
  // 21. KNOWLEDGE COMPONENT (2 per modul = 20 records)
  // =====================================================
  const kcNames = [
    'algoritma_dasar',
    'logika_pemrograman',
    'struktur_data',
    'pemrograman_web',
    'basis_data',
    'coding_pedagogi',
    'logika_ matematika',
    'ml_concepts',
    'jaringan',
    'media_digital',
    'statistika',
  ];
  const knowledgeComponents: { id: string; modulId: string }[] = [];

  for (const modul of moduls) {
    const kc1 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: `${kcNames[moduls.indexOf(modul)]}_1`,
        nama: `KC 1 - ${modul.moduleName}`,
      },
    });
    knowledgeComponents.push(kc1);
    const kc2 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: `${kcNames[moduls.indexOf(modul)]}_2`,
        nama: `KC 2 - ${modul.moduleName}`,
      },
    });
    knowledgeComponents.push(kc2);
  }
  console.log(`21. KnowledgeComponent: ${knowledgeComponents.length} records`);

  // =====================================================
  // 22. PRETEST QUESTION SKILL MAP (1 per soalPretest = 20 records)
  // =====================================================
  for (const soal of allSoalPretest) {
    const modulKcs = knowledgeComponents.filter(
      (kc) => kc.modulId === soal.pretestId,
    );
    if (modulKcs.length > 0) {
      await prisma.pretestQuestionSkillMap.create({
        data: {
          pretestQuestionId: soal.id,
          knowledgeComponentId: modulKcs[0].id,
          weight: 1.0,
        },
      });
    }
  }
  console.log('22. PretestQuestionSkillMap: ~20 records');

  // =====================================================
  // 23. COMPUTATIONAL THINKING (1 per modul = 10 records)
  // =====================================================
  const ctAspek = [
    'Decomposition',
    'Pattern Recognition',
    'Abstraction',
    'Algorithm Design',
  ];
  for (const modul of moduls.slice(0, 5)) {
    await prisma.computationalThinking.create({
      data: {
        modulId: modul.id,
        aspek: ctAspek[moduls.indexOf(modul) % ctAspek.length],
        deskripsi: `Aspek computational thinking untuk modul ${modul.moduleName}.`,
      },
    });
  }
  console.log('23. ComputationalThinking: 5 records');

  // =====================================================
  // 24. PROGRESS (enroll siswa ke modul = 15+ records)
  // =====================================================
  const progresses: { id: string; siswaId: string; modulId: string }[] = [];
  for (let i = 0; i < Math.min(siswas.length, 8); i++) {
    for (let j = 0; j < Math.min(moduls.length, 3); j++) {
      try {
        const progress = await prisma.progress.create({
          data: {
            siswaId: siswas[i].id,
            modulId: moduls[j].id,
            progressPercentage: Math.floor(Math.random() * 100),
            status: j === 0 ? 'IN_PROGRESS' : 'COMPLETED',
            isGraduated: j !== 0,
            pretestScore: Math.floor(Math.random() * 40) + 60,
            posttestScore: Math.floor(Math.random() * 30) + 70,
          },
        });
        progresses.push(progress);
      } catch {
        // skip duplicate (siswaId + modulId unique constraint)
      }
    }
  }
  console.log(`24. Progress: ${progresses.length} records`);

  // =====================================================
  // 25. QUIZ SCORE (1 per progress = ~15 records)
  // =====================================================
  for (const progress of progresses) {
    await prisma.quizScore.create({
      data: {
        progressId: progress.id,
        score: Math.floor(Math.random() * 40) + 60,
        quizType: 'QUIZ',
        questionId: 'seed_question',
      },
    });
  }
  console.log('25. QuizScore: ~15 records');

  // =====================================================
  // 26. PROGRESS DETAIL (1 per progress = ~15 records)
  // =====================================================
  await prisma.progressDetail.create({
    data: {
      siswaId: siswas[0].id,
      submateriId: (await prisma.submateri.findFirst({
        where: {},
        select: { id: true },
      }))!.id,
      isCompleted: true,
      completed_at: new Date(),
    },
  });
  console.log('26. ProgressDetail: 1 record (sample)');

  // =====================================================
  // 27. STUDENT ANSWER LOG (10 records)
  // =====================================================
  for (let i = 0; i < Math.min(10, progresses.length); i++) {
    const modulKcs = knowledgeComponents.filter(
      (kc) => kc.modulId === progresses[i].modulId,
    );
    await prisma.studentAnswerLog.create({
      data: {
        siswaId: progresses[i].siswaId,
        modulId: progresses[i].modulId,
        questionSource: 'QUIZ',
        questionId: 'seed_question',
        knowledgeComponentId: modulKcs.length > 0 ? modulKcs[0].id : undefined,
        isCorrect: Math.random() > 0.5,
        attemptNo: 1,
      },
    });
  }
  console.log('27. StudentAnswerLog: 10 records');

  // =====================================================
  // 28. STUDENT KNOWLEDGE STATE (10 records)
  // =====================================================
  for (let i = 0; i < Math.min(10, progresses.length); i++) {
    const modulKcs = knowledgeComponents.filter(
      (kc) => kc.modulId === progresses[i].modulId,
    );
    if (modulKcs.length > 0) {
      try {
        await prisma.studentKnowledgeState.create({
          data: {
            siswaId: progresses[i].siswaId,
            modulId: progresses[i].modulId,
            knowledgeComponentId: modulKcs[0].id,
            p_mastery_current: Math.random(),
          },
        });
      } catch {
        // skip duplicate (unique constraint)
      }
    }
  }
  console.log('28. StudentKnowledgeState: ~10 records');

  // =====================================================
  // 29. MODULE UNLOCK RULE (5 records)
  // =====================================================
  for (let i = 0; i < Math.min(5, moduls.length); i++) {
    const modulKcs = knowledgeComponents.filter(
      (kc) => kc.modulId === moduls[i].id,
    );
    if (modulKcs.length > 0) {
      await prisma.moduleUnlockRule.create({
        data: {
          modulId: moduls[i].id,
          targetType: 'SUBMATERI',
          targetId: 'seed_target',
          knowledgeComponentId: modulKcs[0].id,
          materyTreshold: 0.8,
        },
      });
    }
  }
  console.log('29. ModuleUnlockRule: 5 records');

  // =====================================================
  // 30. RATING (10+ records)
  // =====================================================
  for (let i = 0; i < Math.min(siswas.length, 10); i++) {
    await prisma.rating.create({
      data: {
        rating: Math.floor(Math.random() * 3) + 3,
        komentar: [
          'Materinya bagus!',
          'Mudah dipahami',
          'Tutorialnya lengkap',
          'Perlu lebih banyak latihan',
          'Sangat bermanfaat',
        ][i % 5],
        siswaId: siswas[i].id,
        modulId: moduls[i % moduls.length].id,
      },
    });
  }
  console.log('30. Rating: 10 records');

  // =====================================================
  // 31. CERTIFICATE (5 records)
  // =====================================================
  const completedProgresses = progresses.filter((p) => {
    const prog = p as any;
    return true;
  });
  for (let i = 0; i < Math.min(5, completedProgresses.length); i++) {
    const p = completedProgresses[i];
    await prisma.certificate.create({
      data: {
        siswaId: p.siswaId,
        modulId: p.modulId,
        kode_sertif: `CERT-${String(i + 1).padStart(5, '0')}`,
        issued_at: new Date(Date.now() - i * 86400000),
        certificateUrl: `https://storage.example.com/cert/CERT-${String(i + 1).padStart(5, '0')}.pdf`,
      },
    });
  }
  console.log('31. Certificate: 5 records');

  // =====================================================
  // 32. AUTOMATIC ACCESS MATERY (5 records)
  // =====================================================
  for (let i = 0; i < Math.min(5, pretests.length); i++) {
    const modulMateris = materis.filter((m) => {
      const topik = topiks.find((t) => t.id === m.topikId);
      return topik && topik.modulId === moduls[i].id;
    });
    if (modulMateris.length > 0) {
      await prisma.automaticAccessMatery.create({
        data: {
          pretestId: pretests[i].id,
          materiId: modulMateris[0].id,
          minScore: 70,
          modulId: moduls[i].id,
        },
      });
    }
  }
  console.log('32. AutomaticAccessMatery: 5 records');

  // =====================================================
  // 33. NOTIFICATION (10 records)
  // =====================================================
  for (let i = 1; i <= 10; i++) {
    await prisma.notification.create({
      data: {
        userId: siswas[0].id,
        title: `Notifikasi ${i}`,
        message: `Ini adalah notifikasi nomor ${i} untuk user.`,
        read: i <= 3,
      },
    });
  }
  console.log('33. Notification: 10 records');

  console.log('\n✓ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
