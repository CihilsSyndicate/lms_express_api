const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const quizScores = await prisma.quizScore.findMany({ take: 5 });
  console.log("QuizScores:");
  console.log(quizScores);
  
  const quizzes = await prisma.quiz.findMany({ take: 5, include: { topik: true }});
  console.log("\nQuizzes:");
  console.log(quizzes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
