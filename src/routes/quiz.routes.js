import { Router } from "express";
import { addQuestionToQuiz, getAllQuestions} from "../controllers/qustion.controller.js";
import { createQuiz, deleteQuiz, getAllQuizzes, submitQuiz} from "../controllers/quiz.controller.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router();

// Create a new quiz
router.post("/create", verifyJWT, verifyAdmin, createQuiz);
router.post("/:quizId/questions/add", verifyJWT, verifyAdmin, addQuestionToQuiz)
router.delete("/:quizId/delete", verifyJWT, verifyAdmin, deleteQuiz);
// router.patch("/:quizId", updateQuestion);


// for Users to attempt quiz
router.get("/", getAllQuizzes);
router.get("/:quizId", getAllQuestions);
router.post("/:quizId/submit", verifyJWT, submitQuiz);



export default router;