
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const tutor = await prisma.tutor.findFirst();
    if (!tutor) {
      console.log('No tutor found!');
      return;
    }

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
      tutorId: tutor.id
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
        modulType: (payload.modulType ?? payload.type ?? 'SISWA') as any,
        isDraft: Boolean(payload.isDraft ?? true),
        moduleImgUrl: (payload.moduleImgUrl) ?? null,
        pretestPostTestEnabled: Boolean(payload.pretestPostTestEnabled ?? true),
        hasStudyGroup: Boolean(payload.hasStudyGroup ?? false),
        hasCertificate: Boolean(payload.hasCertificate ?? false),
        tutorId: String(payload.tutorId ?? ''),
      },
    });
    console.log('SUCCESS:', newModule.id);
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}
run();

