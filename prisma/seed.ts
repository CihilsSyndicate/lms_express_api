import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
  console.log('Seeding database...\n');

  // =====================================================
  // CLEANUP (hapus dalam urutan reverse dependency)
  // =====================================================
  console.log('Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.automaticAccessMatery.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.moduleUnlockRule.deleteMany();
  await prisma.studentKnowledgeState.deleteMany();
  await prisma.studentAnswerLog.deleteMany();
  await prisma.progressDetail.deleteMany();
  await prisma.quizScore.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.computationalThinking.deleteMany();
  await prisma.pretestQuestionSkillMap.deleteMany();
  await prisma.knowledgeComponent.deleteMany();
  await prisma.quizSetting.deleteMany();
  await prisma.quizAnswerOption.deleteMany();
  await prisma.quizGroup.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.topikItem.deleteMany();
  await prisma.materi.deleteMany();
  await prisma.topik.deleteMany();
  await prisma.soalPosttest.deleteMany();
  await prisma.pretestSetting.deleteMany();
  await prisma.pretestAnswerOptions.deleteMany();
  await prisma.soalPretest.deleteMany();
  await prisma.posttest.deleteMany();
  await prisma.pretest.deleteMany();
  await prisma.modul.deleteMany();
  await prisma.socialMedia.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.admin.deleteMany();
  console.log('Cleanup complete.\n');

  // =====================================================
  // 1. ADMIN
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
  // 2. TUTOR
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
        create: {
          ...t,
          password: tutorPassword,
          role: 'tutor',
          signatureUrl: `https://storage.example.com/signature/${t.email.split('@')[0]}.png`,
        },
      }),
    ),
  );
  console.log(`2. Tutor: ${tutors.length} records`);

  // =====================================================
  // 3. SOCIAL MEDIA
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
  // 4. SISWA
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
  console.log(`4. Siswa: ${siswas.length} records`);

  // =====================================================
  // 5. UMUM
  // =====================================================
  const umumPassword = await hashPassword('umum123');
  const umumData = [
    {
      nama_lengkap: 'Bambang Suprapto',
      email: 'umum1@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'UMUM' as const,
    },
    {
      nama_lengkap: 'Kartika Wijaya',
      email: 'umum2@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'UMUM' as const,
    },
    {
      nama_lengkap: 'Eko Prasetyo',
      email: 'umum3@lms.test',
      jenjang: 'SMA',
      kelas_sekolah: 'Umum',
      studentType: 'UMUM' as const,
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
  console.log(`5. Umum: ${umumUsers.length} records`);

  // =====================================================
  // 6. MODUL
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
      hasCertificate: false,
      moduleImgUrl: null as string | null,
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
      hasCertificate: true,
      moduleImgUrl: null as string | null,
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
      hasCertificate: false,
      moduleImgUrl: null as string | null,
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
      hasCertificate: true,
      moduleImgUrl: null as string | null,
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
      hasCertificate: false,
      moduleImgUrl: null as string | null,
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
      hasCertificate: true,
      moduleImgUrl: null as string | null,
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
      hasCertificate: true,
      moduleImgUrl: null as string | null,
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
      hasCertificate: false,
      moduleImgUrl: null as string | null,
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
      hasCertificate: false,
      moduleImgUrl: null as string | null,
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
      hasCertificate: true,
      moduleImgUrl: null as string | null,
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
          rangkumanAkhir: `Rangkuman akhir untuk modul "${m.moduleName}". Kesimpulan dari seluruh materi yang telah dipelajari dalam modul ini.`,
          pretestPostTestEnabled: true,
          hasStudyGroup: false,
          hasCertificate: m.hasCertificate,
          moduleImgUrl: m.moduleImgUrl,
        },
      }),
    ),
  );
  console.log(`6. Modul: ${moduls.length} records`);

  // =====================================================
  // 7. PRETEST
  // =====================================================
  const pretests = await Promise.all(
    moduls.slice(0, 5).map((m) =>
      prisma.pretest.create({
        data: { pretestName: `Pretest ${m.moduleName}` },
      }),
    ),
  );

  const pretestToModulMap = new Map<string, string>();
  for (let i = 0; i < pretests.length; i++) {
    await prisma.modul.update({
      where: { id: moduls[i].id },
      data: { pretestId: pretests[i].id },
    });
    pretestToModulMap.set(pretests[i].id, moduls[i].id);
  }
  console.log(`7. Pretest: ${pretests.length} records`);

  // =====================================================
  // 8. POSTTEST
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
  console.log(`8. Posttest: ${posttests.length} records`);

  // =====================================================
  // 9. SOAL PRETEST & PRETEST ANSWER OPTIONS
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
      options: ['Queue', 'Array', 'Stack', 'Linked List'],
      correctAnswerIdx: 2,
      skor: 10,
    },
    {
      pertanyaan: 'Kompleksitas Binary Search adalah...',
      options: ['O(n)', 'O(n\u00B2)', 'O(1)', 'O(log n)'],
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
  console.log(`9. SoalPretest: ${allSoalPretest.length} records`);

  // =====================================================
  // 10. PRETEST SETTING
  // =====================================================
  for (const pt of pretests) {
    await prisma.pretestSetting.create({
      data: { pretestId: pt.id, duration: 1800, countShownQuestions: 10 },
    });
  }
  console.log('10. PretestSetting: 5 records');

  // =====================================================
  // 11. SOAL POSTTEST
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
  console.log('11. SoalPosttest: 20 records');

  // =====================================================
  // 12. TOPIK
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

  const topiks: { id: string; modulId: string; nama: string }[] = [];
  for (let i = 0; i < moduls.length; i++) {
    for (const nama of topikNames[i]) {
      const topik = await prisma.topik.create({
        data: {
          nama,
          modulId: moduls[i].id,
          rangkumanTopik: `Rangkuman untuk topik "${nama}". Poin-poin penting yang perlu diingat dari materi ini.`,
        },
      });
      topiks.push({ id: topik.id, modulId: topik.modulId, nama });
    }
  }
  console.log(`12. Topik: ${topiks.length} records`);

  // =====================================================
  // 13. MATERI
  // =====================================================
  const materis: { id: string; topikId: string }[] = [];
  for (const topik of topiks) {
    const m1 = await prisma.materi.create({
      data: {
        tutorId: tutors[0].id,
        topikId: topik.id,
        judul: `Materi Teks - ${topik.nama}`,
        isVideo: false,
        article: `Artikel pembelajaran untuk topik "${topik.nama}". Berisi penjelasan lengkap dan contoh-contoh yang mudah dipahami oleh siswa.`,
      },
    });
    materis.push({ id: m1.id, topikId: topik.id });

    const m2 = await prisma.materi.create({
      data: {
        tutorId: tutors[1].id,
        topikId: topik.id,
        judul: `Materi Video - ${topik.nama}`,
        isVideo: true,
        videoUrl: `https://storage.example.com/video/${topik.id}.mp4`,
      },
    });
    materis.push({ id: m2.id, topikId: topik.id });
  }
  console.log(`13. Materi: ${materis.length} records`);

  // =====================================================
  // 14. TOPIK ITEM
  // =====================================================
  for (let i = 0; i < materis.length; i++) {
    await prisma.topikItem.create({
      data: {
        topikId: materis[i].topikId,
        itemId: materis[i].id,
        orderNumber: (i % 2) + 1,
        itemType: i % 2 === 0 ? 'MATERI' : 'QUIZ',
      },
    });
  }
  console.log('14. TopikItem: 40 records');

  // =====================================================
  // 15. QUIZ & QUIZ ANSWER OPTIONS
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
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswer: 'Stack',
      skor: 10,
    },
    {
      question: 'Tag HTML untuk membuat heading terbesar adalah...',
      options: ['<heading>', '<h6>', '<h1>', '<head>'],
      correctAnswer: '<h1>',
      skor: 10,
    },
    {
      question: 'Perintah SQL untuk mengambil data dari tabel adalah...',
      options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
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
      options: ['{0}', '{}', '\u2205', 'None'],
      correctAnswer: '\u2205',
      skor: 10,
    },
    {
      question:
        'Algoritma Machine Learning untuk prediksi nilai kontinu adalah...',
      options: ['Klasifikasi', 'Regresi', 'Clustering', 'Asosiasi'],
      correctAnswer: 'Regresi',
      skor: 10,
    },
    {
      question: 'Protokol yang digunakan untuk mengirim email adalah...',
      options: ['HTTP', 'FTP', 'SMTP', 'SSH'],
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
      options: ['Mean', 'Median', 'Modus', 'Range'],
      correctAnswer: 'Modus',
      skor: 10,
    },
  ];

  const quizzes: { id: string }[] = [];
  for (let i = 0; i < moduls.length; i++) {
    const modulTopiks = topiks.filter((t) => t.modulId === moduls[i].id);
    if (modulTopiks.length > 0) {
      const q = quizQuestions[i];
      const quiz = await prisma.quiz.create({
        data: {
          topikId: modulTopiks[0].id,
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
  console.log(`15. Quiz: ${quizzes.length} records`);

  // =====================================================
  // 16. QUIZ SETTING
  // =====================================================
  for (const quiz of quizzes) {
    await prisma.quizSetting.create({
      data: {
        quizId: quiz.id,
        timeLimit: 60,
        allowMultipleAttempts: true,
        isComputationalThinkingEnabled: false,
        minScoreTreshold: 70,
        standardScorePerQuestion: 10,
      },
    });
  }
  console.log('16. QuizSetting: 10 records');

  // =====================================================
  // 16b. QUIZ GROUP
  // =====================================================
  const quizGroups: { id: string; quizId: string }[] = [];
  for (let i = 0; i < quizzes.length; i++) {
    const quiz = quizzes[i];
    const modulTopiks = topiks.filter((t) => t.modulId === moduls[i].id);
    if (modulTopiks.length > 0) {
      const group = await prisma.quizGroup.create({
        data: {
          topikId: modulTopiks[0].id,
          nama: `Kuis ${moduls[i].moduleName}`,
          quizType: 'REGULER',
        },
      });
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { quizGroupId: group.id },
      });
      quizGroups.push({ id: group.id, quizId: quiz.id });
    }
  }
  console.log(`16b. QuizGroup: ${quizGroups.length} records`);

  // =====================================================
  // 17. KNOWLEDGE COMPONENT
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
    const idx = moduls.indexOf(modul);
    const kc1 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: `${kcNames[idx]}_1`,
        nama: `KC 1 - ${modul.moduleName}`,
        deskripsi: `Knowledge component untuk modul ${modul.moduleName} bagian 1`,
      },
    });
    knowledgeComponents.push(kc1);
    const kc2 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: `${kcNames[idx]}_2`,
        nama: `KC 2 - ${modul.moduleName}`,
        deskripsi: `Knowledge component untuk modul ${modul.moduleName} bagian 2`,
      },
    });
    knowledgeComponents.push(kc2);
  }
  console.log(`17. KnowledgeComponent: ${knowledgeComponents.length} records`);

  // =====================================================
  // 18. PRETEST QUESTION SKILL MAP (BUG FIXED)
  // =====================================================
  for (const soal of allSoalPretest) {
    const modulId = pretestToModulMap.get(soal.pretestId);
    if (!modulId) continue;
    const modulKcs = knowledgeComponents.filter((kc) => kc.modulId === modulId);
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
  console.log('18. PretestQuestionSkillMap: ~20 records');

  // =====================================================
  // 19. COMPUTATIONAL THINKING
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
  console.log('19. ComputationalThinking: 5 records');

  // =====================================================
  // 20. PROGRESS (enroll siswa ke modul)
  // =====================================================
  const progresses: { id: string; siswaId: string; modulId: string }[] = [];

  const modulContentMap = new Map<string, { id: string; type: string }[]>();
  for (const m of moduls) {
    const materiItems = (
      await prisma.materi.findMany({
        where: { topik: { modulId: m.id } },
        select: { id: true },
      })
    ).map((s) => ({ id: s.id, type: 'MATERI' as const }));
    const quizItems = (
      await prisma.quiz.findMany({
        where: { topik: { modulId: m.id } },
        select: { id: true },
      })
    ).map((q) => ({ id: q.id, type: 'QUIZ' as const }));
    modulContentMap.set(m.id, [...materiItems, ...quizItems]);
  }

  function buildCompletedContentItems(
    modulId: string,
    isCompleted: boolean,
    seedVal: number,
  ): string {
    const contentItems = modulContentMap.get(modulId) ?? [];
    const items: {
      itemId: string;
      itemType: string;
      completedAt: string;
    }[] = [];

    const ts = (offset: number) =>
      new Date(Date.now() - offset * 86400000).toISOString();

    items.push({
      itemId: 'pretest',
      itemType: 'PRETEST',
      completedAt: ts(30),
    });

    const takeCount = isCompleted
      ? contentItems.length
      : Math.max(1, Math.floor((seedVal / 100) * contentItems.length));

    for (let k = 0; k < Math.min(takeCount, contentItems.length); k++) {
      const ci = contentItems[k];
      items.push({
        itemId: ci.id,
        itemType: ci.type,
        completedAt: ts(29 - k),
      });
    }

    if (isCompleted) {
      items.push({
        itemId: 'posttest',
        itemType: 'POSTTEST',
        completedAt: ts(1),
      });
      items.push({
        itemId: 'rating',
        itemType: 'RATING',
        completedAt: ts(0),
      });
    }

    return JSON.stringify(items);
  }

  for (let i = 0; i < Math.min(siswas.length, 8); i++) {
    for (let j = 0; j < Math.min(moduls.length, 3); j++) {
      try {
        const isCompleted = j !== 0;
        const seedVal = Math.floor(Math.random() * 100);
        const completedContentItems = buildCompletedContentItems(
          moduls[j].id,
          isCompleted,
          seedVal,
        );

        const progress = await prisma.progress.create({
          data: {
            siswaId: siswas[i].id,
            modulId: moduls[j].id,
            progressPercentage: isCompleted ? 100 : seedVal,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            isGraduated: isCompleted,
            pretestScore: isCompleted
              ? 85
              : Math.floor(Math.random() * 40) + 60,
            posttestScore: isCompleted ? 80 : null,
            completedContentItems,
          },
        });
        progresses.push(progress);
      } catch {
        // skip duplicate (siswaId + modulId unique constraint)
      }
    }
  }
  console.log(`20. Progress: ${progresses.length} records`);

  // =====================================================
  // 21. QUIZ SCORE
  // =====================================================
  for (const progress of progresses) {
    // Find a quiz associated with this module
    const modulKcs = knowledgeComponents.filter((kc) => kc.modulId === progress.modulId);
    let quizId = 'seed_question'; // Fallback
    const quizFromModul = quizzes.find((q) => {
      const topik = topiks.find((t) => t.id === (q as any).topikId);
      return topik && topik.modulId === progress.modulId;
    });
    if (quizFromModul) {
      quizId = quizFromModul.id;
    }

    await prisma.quizScore.create({
      data: {
        progressId: progress.id,
        score: Math.floor(Math.random() * 40) + 60,
        quizType: 'QUIZ',
        questionId: quizId,
      },
    });
  }
  console.log('21. QuizScore: ~15 records');

  // =====================================================
  // 22. PROGRESS DETAIL
  // =====================================================
  await prisma.progressDetail.create({
    data: {
      siswaId: siswas[0].id,
      materiId: (await prisma.materi.findFirst({
        where: {},
        select: { id: true },
      }))!.id,
      isCompleted: true,
      completed_at: new Date(),
    },
  });
  console.log('22. ProgressDetail: 1 record (sample)');

  // =====================================================
  // 23. STUDENT ANSWER LOG
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
  console.log('23. StudentAnswerLog: 10 records');

  // =====================================================
  // 24. STUDENT KNOWLEDGE STATE
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
  console.log('24. StudentKnowledgeState: ~10 records');

  // =====================================================
  // 25. MODULE UNLOCK RULE
  // =====================================================
  for (let i = 0; i < Math.min(5, moduls.length); i++) {
    const modulKcs = knowledgeComponents.filter(
      (kc) => kc.modulId === moduls[i].id,
    );
    if (modulKcs.length > 0) {
      await prisma.moduleUnlockRule.create({
        data: {
          modulId: moduls[i].id,
          targetType: 'MATERI',
          targetId: 'seed_target',
          knowledgeComponentId: modulKcs[0].id,
          materyTreshold: 0.8,
        },
      });
    }
  }
  console.log('25. ModuleUnlockRule: 5 records');

  // =====================================================
  // 26. RATING
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
  console.log('26. Rating: 10 records');

  // =====================================================
  // 27. CERTIFICATE
  // =====================================================
  for (let i = 0; i < Math.min(5, progresses.length); i++) {
    const p = progresses[i];
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
  console.log('27. Certificate: 5 records');

  // =====================================================
  // 28. AUTOMATIC ACCESS MATERY
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
  console.log('28. AutomaticAccessMatery: 5 records');

  // =====================================================
  // 29. NOTIFICATION
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
  console.log('29. Notification: 10 records');

  console.log('\n\u2713 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });