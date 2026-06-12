import { prisma } from './src/lib/prisma';

async function main() {
  const quizScores = await prisma.quizScore.findMany({
    include: {
      progress: {
        include: {
          modul: {
            include: {
              topiks: {
                include: {
                  quizzes: true
                }
              }
            }
          }
        }
      }
    }
  });

  let updated = 0;
  for (const qs of quizScores) {
    if (qs.questionId === 'seed_question' || qs.questionId === 'Unknown') {
      let validQuizId = null;
      for (const topik of qs.progress.modul.topiks) {
        if (topik.quizzes.length > 0) {
          validQuizId = topik.quizzes[0].id;
          break;
        }
      }

      if (validQuizId) {
        await prisma.quizScore.update({
          where: { id: qs.id },
          data: { questionId: validQuizId }
        });
        updated++;
      }
    }
  }

  console.log(`Updated ${updated} QuizScores with valid questionIds.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
