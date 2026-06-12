
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const payload = {
      moduleName: 'Test Modul',
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      targetTime: 120,
      difficulty: 'Beginner',
      isPaid: false,
      modulPrice: 0,
      level: 'SMA',
      class: '10',
      type: 'SISWA',
      modulType: 'SISWA',
      isDraft: false,
      moduleImgUrl: null,
      pretestPostTestEnabled: true,
      hasStudyGroup: false,
      hasCertificate: true,
      tutorId: 'cmqaau65d0006xsu23w0e0s0f'
    };
    
    const newModule = await prisma.modul.create({
      data: {
        moduleName: String(payload.moduleName ?? ''),
        subtitle: String(payload.subtitle ?? ''),
        description: String(payload.description ?? ''),
        targetTime: Number(payload.targetTime ?? 60),
        difficulty: String(payload.difficulty ?? 'Menengah'),
        isPaid: Boolean(payload.isPaid ?? false),
        modulPrice: Number(payload.modulPrice ?? 0),
        level: (payload.level) ?? null,
        class: (payload.class) ?? null,
        modulType: (payload.modulType ?? payload.type ?? 'SISWA'),
        isDraft: Boolean(payload.isDraft ?? true),
        moduleImgUrl: (payload.moduleImgUrl) ?? null,
        pretestPostTestEnabled: Boolean(payload.pretestPostTestEnabled ?? true),
        hasStudyGroup: Boolean(payload.hasStudyGroup ?? false),
        hasCertificate: Boolean(payload.hasCertificate ?? false),
        tutorId: String(payload.tutorId ?? ''),
      },
    });
    console.log(newModule);
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}
run();

