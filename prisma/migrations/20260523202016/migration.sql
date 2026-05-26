-- DropForeignKey
ALTER TABLE "AutomaticAccessMatery" DROP CONSTRAINT "AutomaticAccessMatery_materiId_fkey";

-- DropForeignKey
ALTER TABLE "AutomaticAccessMatery" DROP CONSTRAINT "AutomaticAccessMatery_modulId_fkey";

-- DropForeignKey
ALTER TABLE "AutomaticAccessMatery" DROP CONSTRAINT "AutomaticAccessMatery_pretestId_fkey";

-- DropForeignKey
ALTER TABLE "AutomaticAccessMatery" DROP CONSTRAINT "AutomaticAccessMatery_soalPretestId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_modulId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_siswaId_fkey";

-- DropForeignKey
ALTER TABLE "ComputationalThinking" DROP CONSTRAINT "ComputationalThinking_modulId_fkey";

-- DropForeignKey
ALTER TABLE "Materi" DROP CONSTRAINT "Materi_topikId_fkey";

-- DropForeignKey
ALTER TABLE "Materi" DROP CONSTRAINT "Materi_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_posttestId_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_pretestId_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "PretestAnswerOptions" DROP CONSTRAINT "PretestAnswerOptions_soalPretestId_fkey";

-- DropForeignKey
ALTER TABLE "PretestSetting" DROP CONSTRAINT "PretestSetting_pretestId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_modulId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_siswaId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressDetail" DROP CONSTRAINT "ProgressDetail_submateriId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_materiId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswerOption" DROP CONSTRAINT "QuizAnswerOption_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizScore" DROP CONSTRAINT "QuizScore_progressId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSetting" DROP CONSTRAINT "QuizSetting_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_modulId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_siswaId_fkey";

-- DropForeignKey
ALTER TABLE "Signature" DROP CONSTRAINT "Signature_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "SoalPosttest" DROP CONSTRAINT "SoalPosttest_posttestId_fkey";

-- DropForeignKey
ALTER TABLE "SoalPretest" DROP CONSTRAINT "SoalPretest_pretestId_fkey";

-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Submateri" DROP CONSTRAINT "Submateri_materiId_fkey";

-- DropForeignKey
ALTER TABLE "Topik" DROP CONSTRAINT "Topik_modulId_fkey";

-- DropForeignKey
ALTER TABLE "TopikItem" DROP CONSTRAINT "TopikItem_topikId_fkey";

-- DropForeignKey
ALTER TABLE "knowledge_component" DROP CONSTRAINT "knowledge_component_modulId_fkey";

-- DropForeignKey
ALTER TABLE "module_unlock_rule" DROP CONSTRAINT "module_unlock_rule_knowledgeComponentId_fkey";

-- DropForeignKey
ALTER TABLE "module_unlock_rule" DROP CONSTRAINT "module_unlock_rule_modulId_fkey";

-- DropForeignKey
ALTER TABLE "pretest_question_skill_map" DROP CONSTRAINT "pretest_question_skill_map_knowledgeComponentId_fkey";

-- DropForeignKey
ALTER TABLE "pretest_question_skill_map" DROP CONSTRAINT "pretest_question_skill_map_pretestQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_knowledgeComponentId_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_modulId_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_siswaId_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_knowledgeComponentId_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_modulId_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_siswaId_fkey";

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topik" ADD CONSTRAINT "Topik_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopikItem" ADD CONSTRAINT "TopikItem_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submateri" ADD CONSTRAINT "Submateri_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswerOption" ADD CONSTRAINT "QuizAnswerOption_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSetting" ADD CONSTRAINT "QuizSetting_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPretest" ADD CONSTRAINT "SoalPretest_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretestAnswerOptions" ADD CONSTRAINT "PretestAnswerOptions_soalPretestId_fkey" FOREIGN KEY ("soalPretestId") REFERENCES "SoalPretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretestSetting" ADD CONSTRAINT "PretestSetting_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_soalPretestId_fkey" FOREIGN KEY ("soalPretestId") REFERENCES "SoalPretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPosttest" ADD CONSTRAINT "SoalPosttest_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputationalThinking" ADD CONSTRAINT "ComputationalThinking_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_component" ADD CONSTRAINT "knowledge_component_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_pretestQuestionId_fkey" FOREIGN KEY ("pretestQuestionId") REFERENCES "SoalPretest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizScore" ADD CONSTRAINT "QuizScore_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "Progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressDetail" ADD CONSTRAINT "ProgressDetail_submateriId_fkey" FOREIGN KEY ("submateriId") REFERENCES "Submateri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
