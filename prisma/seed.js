/**
 * Prisma Seed Script — Tutor Initial Data
 *
 * Run with:
 *   npx prisma db seed
 *
 * Or via package.json script:
 *   npm run seed
 */

const { PrismaClient } = require('./src/generated/prisma');
const { hashSync, genSaltSync } = require('bcrypt-ts');

const prisma = new PrismaClient();

const TUTOR_DATA = [
  {
    nama_lengkap: 'Admin Tutor',
    email: 'tutor@fastlms.com',
    password: 'tutor123',          // plain text — will be hashed below
    gender: 'Laki-laki',
    pekerjaan: 'Pengajar',
    no_whatsapp: '081234567890',
    pendidikan_terakhir: 'S1',
    nama_instansi: 'FastLMS',
    prodi: 'Pendidikan',
    cv_path_url: '',
  },
];

async function main() {
  console.log('🌱 Seeding tutor data...');

  for (const tutor of TUTOR_DATA) {
    const existing = await prisma.tutor.findUnique({
      where: { email: tutor.email },
    });

    if (existing) {
      console.log(`⚠️  Tutor ${tutor.email} already exists — skipped.`);
      continue;
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(tutor.password, salt);

    const created = await prisma.tutor.create({
      data: {
        ...tutor,
        password: hashedPassword,
      },
    });

    console.log(`✅ Tutor created: ${created.email} (ID: ${created.id})`);
  }

  console.log('🌱 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
