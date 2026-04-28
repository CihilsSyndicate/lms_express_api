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
      nama_lengkap: 'Dr. Ahmad Tutor',
      email: 'tutor@example.com',
      password: tutorPassword,
      gender: 'Laki-laki',
      pekerjaan: 'Dosen',
      no_whatsapp: '08123456789',
      pendidikan_terakhir: 'S3',
      nama_instansi: 'Universitas ABC',
      prodi: 'Matematika',
      cv_path_url: 'https://example.com/cv.pdf',
    },
  });

  // Create siswa
  const siswaPassword = hashSync('password123', genSaltSync(10));
  const siswa1 = await prisma.siswa.upsert({
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

  const siswa2 = await prisma.siswa.upsert({
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
    where: { nama_modul: 'Aljabar Dasar' },
  });

  if (!modul) {
    modul = await prisma.modul.create({
      data: {
        nama_modul: 'Aljabar Dasar',
        deskripsi: 'Modul pembelajaran aljabar untuk siswa SMA',
        target_waktu: 120,
        tingkat_kesulitan: 'Beginner',
        jenjang: 'SMA',
        kelas_sekolah: '10-12',
        tutor_id: tutor.id,
      },
    });
  }

  // Create knowledge components
  let kc1 = await prisma.knowledgeComponent.findFirst({
    where: { code: 'algebra_basics', modul_id: modul.id },
  });

  if (!kc1) {
    kc1 = await prisma.knowledgeComponent.create({
      data: {
        modul_id: modul.id,
        code: 'algebra_basics',
        nama: 'Dasar Aljabar',
        deskripsi: 'Konsep dasar aljabar seperti variabel dan operasi',
      },
    });
  }

  let kc2 = await prisma.knowledgeComponent.findFirst({
    where: { code: 'equations', modul_id: modul.id },
  });

  if (!kc2) {
    kc2 = await prisma.knowledgeComponent.create({
      data: {
        modul_id: modul.id,
        code: 'equations',
        nama: 'Persamaan Linear',
        deskripsi: 'Menyelesaikan persamaan linear',
      },
    });
  }

  // Create materi
  let materi1 = await prisma.materi.findFirst({
    where: { modul_id: modul.id, is_video: true },
  });

  if (!materi1) {
    materi1 = await prisma.materi.create({
      data: {
        modul_id: modul.id,
        tutor_id: tutor.id,
        is_video: true,
        video_url: 'https://example.com/video1.mp4',
      },
    });
  }

  // Create submateri
  let submateri1 = await prisma.submateri.findFirst({
    where: { materi_id: materi1.id, judul: 'Pengenalan Variabel' },
  });

  if (!submateri1) {
    submateri1 = await prisma.submateri.create({
      data: {
        materi_id: materi1.id,
        judul: 'Pengenalan Variabel',
        konten: 'Konten tentang variabel...',
      },
    });
  }

  let submateri2 = await prisma.submateri.findFirst({
    where: { materi_id: materi1.id, judul: 'Operasi Aljabar' },
  });

  if (!submateri2) {
    submateri2 = await prisma.submateri.create({
      data: {
        materi_id: materi1.id,
        judul: 'Operasi Aljabar',
        konten: 'Konten tentang operasi...',
      },
    });
  }

  // Create topik
  const existingTopik = await prisma.topik.findFirst({
    where: { modul_id: modul.id, nama: 'Variabel dan Konstanta' },
  });

  if (!existingTopik) {
    await prisma.topik.create({
      data: {
        modul_id: modul.id,
        nama: 'Variabel dan Konstanta',
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
        modul: {
          connect: { id: modul.id },
        },
      },
    });

    await prisma.modul.update({
      where: { id: modul.id },
      data: { pretest_id: pretest.id },
    });
  }

  // Create soal pretest with mapping
  let soal1 = await prisma.soalPretest.findFirst({
    where: { pretest_id: pretest.id, pertanyaan: 'Apa itu variabel?' },
  });

  if (!soal1) {
    soal1 = await prisma.soalPretest.create({
      data: {
        pretest_id: pretest.id,
        pertanyaan: 'Apa itu variabel?',
        pilihan: [
          'Konstanta',
          'Simbol untuk nilai yang berubah',
          'Angka tetap',
        ],
        jawaban_benar: 'Simbol untuk nilai yang berubah',
        skor: 10,
      },
    });

    await prisma.pretestQuestionSkillMap.create({
      data: {
        soal_pretest_id: soal1.id,
        knowledge_component_id: kc1.id,
        weight: 1.0,
      },
    });
  }

  let soal2 = await prisma.soalPretest.findFirst({
    where: { pretest_id: pretest.id, pertanyaan: '2x + 3 = 7, x = ?' },
  });

  if (!soal2) {
    soal2 = await prisma.soalPretest.create({
      data: {
        pretest_id: pretest.id,
        pertanyaan: '2x + 3 = 7, x = ?',
        pilihan: ['2', '4', '1'],
        jawaban_benar: '2',
        skor: 10,
      },
    });

    await prisma.pretestQuestionSkillMap.create({
      data: {
        soal_pretest_id: soal2.id,
        knowledge_component_id: kc2.id,
        weight: 1.0,
      },
    });
  }

  // Create unlock rules
  const existingRule = await prisma.moduleUnlockRule.findFirst({
    where: {
      modul_id: modul.id,
      target_type: 'SUBMATERI',
      target_id: submateri2.id,
    },
  });

  if (!existingRule) {
    await prisma.moduleUnlockRule.create({
      data: {
        modul_id: modul.id,
        target_type: 'SUBMATERI',
        target_id: submateri2.id,
        knowledge_component_id: kc1.id,
        mastery_threshold: 0.8,
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
