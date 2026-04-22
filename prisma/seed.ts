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
  const tutor = await prisma.tutor.create({
    data: {
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
  const siswa1 = await prisma.siswa.create({
    data: {
      nama_lengkap: 'Siswa Satu',
      email: 'siswa1@example.com',
      password: siswaPassword,
      jenjang: 'SMA',
      kelas_sekolah: '12',
    },
  });

  const siswa2 = await prisma.siswa.create({
    data: {
      nama_lengkap: 'Siswa Dua',
      email: 'siswa2@example.com',
      password: siswaPassword,
      jenjang: 'SMA',
      kelas_sekolah: '11',
    },
  });

  // Create modul
  const modul = await prisma.modul.create({
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

  // Create knowledge components
  const kc1 = await prisma.knowledgeComponent.create({
    data: {
      modul_id: modul.id,
      code: 'algebra_basics',
      nama: 'Dasar Aljabar',
      deskripsi: 'Konsep dasar aljabar seperti variabel dan operasi',
    },
  });

  const kc2 = await prisma.knowledgeComponent.create({
    data: {
      modul_id: modul.id,
      code: 'equations',
      nama: 'Persamaan Linear',
      deskripsi: 'Menyelesaikan persamaan linear',
    },
  });

  // Create materi
  const materi1 = await prisma.materi.create({
    data: {
      modul_id: modul.id,
      tutor_id: tutor.id,
      is_video: true,
      video_url: 'https://example.com/video1.mp4',
    },
  });

  // Create submateri
  const submateri1 = await prisma.submateri.create({
    data: {
      materi_id: materi1.id,
      judul: 'Pengenalan Variabel',
      konten: 'Konten tentang variabel...',
    },
  });

  const submateri2 = await prisma.submateri.create({
    data: {
      materi_id: materi1.id,
      judul: 'Operasi Aljabar',
      konten: 'Konten tentang operasi...',
    },
  });

  // Create topik
  await prisma.topik.create({
    data: {
      modul_id: modul.id,
      nama: 'Variabel dan Konstanta',
    },
  });

  // Create pretest
  const pretest = await prisma.pretest.create({
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

  // Create soal pretest with mapping
  const soal1 = await prisma.soalPretest.create({
    data: {
      pretest_id: pretest.id,
      pertanyaan: 'Apa itu variabel?',
      pilihan: ['Konstanta', 'Simbol untuk nilai yang berubah', 'Angka tetap'],
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

  const soal2 = await prisma.soalPretest.create({
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

  // Create unlock rules
  await prisma.moduleUnlockRule.create({
    data: {
      modul_id: modul.id,
      target_type: 'SUBMATERI',
      target_id: submateri2.id,
      knowledge_component_id: kc1.id,
      mastery_threshold: 0.8,
    },
  });

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
