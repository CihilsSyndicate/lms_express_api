
import { createModule } from './src/utils/modul';
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const tutor = await prisma.tutor.findFirst();
    const payload = {
      moduleName: 'Test Modul 2',
      subtitle: 'Test',
      description: 'Test',
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
      tutorId: tutor?.id
    };
    
    const newModule = await createModule(payload);
    console.log('SUCCESS:', newModule.id);
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}
run();

