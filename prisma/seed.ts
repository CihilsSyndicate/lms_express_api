/**
 * Prisma Seed Script — LMS Initial Data with BKT
 *
 * Run with:
 *   npx prisma db seed
 */

import { prisma } from '../src/lib/prisma';
import { hashSync, genSaltSync } from 'bcrypt-ts';
import 'dotenv/config';

async function main() {
  console.log('🌱 Seeding LMS data with BKT...');

  // Create tutor
  const tutorPassword = hashSync('password123', genSaltSync(10));
  const tutor = await prisma.tutor.upsert({
    where: { email: 'tutor@example.com' },
    update: {},
    create: {
      fullName: 'Dr. Ahmad Tutor',
      email: 'tutor@example.com',
      password: tutorPassword,
      gender: 'Laki-laki',
      pekerjaan: 'Dosen',
      whatsappNumber: '08123456789',
      lastEducation: 'S3',
      institution: 'Universitas ABC',
      prodi: 'Matematika',
      cvPathUrl: 'https://example.com/cv.pdf',
    },
  });

  // Create siswa
  const siswaPassword = hashSync('password123', genSaltSync(10));
  await prisma.siswa.upsert({
    where: { email: 'siswa1@example.com' },
    update: {},
    create: {
      nama_lengkap: 'Siswa Satu',
      email: 'siswa1@example.com',
      password: siswaPassword,
      jenjang: 'SMA',
      kelas_sekolah: '12',
    },
  });

  await prisma.siswa.upsert({
    where: { email: 'siswa2@example.com' },
    update: {},
    create: {
      nama_lengkap: 'Siswa Dua',
      email: 'siswa2@example.com',
      password: siswaPassword,
      jenjang: 'SMA',
      kelas_sekolah: '11',
    },
  });

  // Create modul
  let modul = await prisma.modul.findFirst({
    where: { moduleName: 'Aljabar Dasar' },
  });

  if (!modul) {
    modul = await prisma.modul.create({
      data: {
        moduleName: 'Aljabar Dasar',
        description: 'Modul pembelajaran aljabar untuk siswa SMA',
        subtitle: 'Belajar Aljabar Dasar dengan mudah',
        targetTime: 120,
        difficulty: 'Beginner',
        level: 'SMA',
        class: '10-12',
        tutorId: tutor.id,
      },
    });
  }

  // Create knowledge components
  let kc1 = await prisma.knowledgeComponent.findFirst({
    where: { code: 'algebra_basics', modulId: modul.id },
  });

  if (!kc1) {
    kc1 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: 'algebra_basics',
        nama: 'Dasar Aljabar',
        deskripsi: 'Konsep dasar aljabar seperti variabel dan operasi',
      },
    });
  }

  let kc2 = await prisma.knowledgeComponent.findFirst({
    where: { code: 'equations', modulId: modul.id },
  });

  if (!kc2) {
    kc2 = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: 'equations',
        nama: 'Persamaan Linear',
        deskripsi: 'Menyelesaikan persamaan linear',
      },
    });
  }

  // Create topik
  let topik = await prisma.topik.findFirst({
    where: { modulId: modul.id, nama: 'Variabel dan Konstanta' },
  });

  if (!topik) {
    topik = await prisma.topik.create({
      data: {
        modulId: modul.id,
        nama: 'Variabel dan Konstanta',
      },
    });
  }

  // Create materi
  let materi1 = await prisma.materi.findFirst({
    where: { topikId: topik.id, isVideo: true },
  });

  if (!materi1) {
    materi1 = await prisma.materi.create({
      data: {
        topikId: topik.id,
        tutorId: tutor.id,
        isVideo: true,
        videoUrl: 'https://example.com/video1.mp4',
      },
    });
  }

  // Create submateri
  let submateri1 = await prisma.submateri.findFirst({
    where: { materiId: materi1.id, judul: 'Pengenalan Variabel' },
  });

  if (!submateri1) {
    submateri1 = await prisma.submateri.create({
      data: {
        materiId: materi1.id,
        judul: 'Pengenalan Variabel',
        konten: 'Konten tentang variabel...',
      },
    });
  }

  let submateri2 = await prisma.submateri.findFirst({
    where: { materiId: materi1.id, judul: 'Operasi Aljabar' },
  });

  if (!submateri2) {
    submateri2 = await prisma.submateri.create({
      data: {
        materiId: materi1.id,
        judul: 'Operasi Aljabar',
        konten: 'Konten tentang operasi...',
      },
    });
  }

  // Create pretest
  let pretest = await prisma.pretest.findFirst({
    where: { modul: { id: modul.id } },
  });

  if (!pretest) {
    pretest = await prisma.pretest.create({
      data: {
        pretestName: 'Pretest Aljabar Dasar',
      },
    });

    await prisma.modul.update({
      where: { id: modul.id },
      data: { pretestId: pretest.id },
    });
  }

  // Create soal pretest with mapping
  let soal1 = await prisma.soalPretest.findFirst({
    where: { pretestId: pretest.id, pertanyaan: 'Apa itu variabel?' },
  });

  if (!soal1) {
    soal1 = await prisma.soalPretest.create({
      data: {
        pretestId: pretest.id,
        pertanyaan: 'Apa itu variabel?',
        answerOptions: {
          create: [
            { option: 'Konstanta' },
            { option: 'Simbol untuk nilai yang berubah' },
            { option: 'Angka tetap' },
          ]
        },
        correctAnswer: 'Simbol untuk nilai yang berubah',
        skor: 10,
      },
    });

    await prisma.pretestQuestionSkillMap.create({
      data: {
        pretestQuestionId: soal1.id,
        knowledgeComponentId: kc1.id,
        weight: 1.0,
      },
    });
  }

  let soal2 = await prisma.soalPretest.findFirst({
    where: { pretestId: pretest.id, pertanyaan: '2x + 3 = 7, x = ?' },
  });

  if (!soal2) {
    soal2 = await prisma.soalPretest.create({
      data: {
        pretestId: pretest.id,
        pertanyaan: '2x + 3 = 7, x = ?',
        answerOptions: {
          create: [
            { option: '2' },
            { option: '4' },
            { option: '1' },
          ]
        },
        correctAnswer: '2',
        skor: 10,
      },
    });

    await prisma.pretestQuestionSkillMap.create({
      data: {
        pretestQuestionId: soal2.id,
        knowledgeComponentId: kc2.id,
        weight: 1.0,
      },
    });
  }

  // Create unlock rules
  const existingRule = await prisma.moduleUnlockRule.findFirst({
    where: {
      modulId: modul.id,
      targetType: 'SUBMATERI',
      targetId: submateri2.id,
    },
  });

  if (!existingRule) {
    await prisma.moduleUnlockRule.create({
      data: {
        modulId: modul.id,
        targetType: 'SUBMATERI',
        targetId: submateri2.id,
        knowledgeComponentId: kc1.id,
        materyTreshold: 0.8,
      },
    });
  }

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
