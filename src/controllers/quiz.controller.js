import db from "../db/db.js"; // Import SQL db helper
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createQuiz = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    const created_by = req.user?.user_id;

    // 1. Insert the new quiz
    const result = await db.query(
        "INSERT INTO Quizzes (title, created_by) VALUES (?, ?)",
        [title, created_by]
    );

    const newQuizId = result.insertId;
    if (!newQuizId) {
        throw new ApiError(500, "Failed to create the quiz");
    }

    const [quiz] = await db.query(
        "SELECT * FROM Quizzes WHERE quiz_id = ?",
        [newQuizId]
    );

    if (!quiz) {
        throw new ApiError(500, "Failed to create the quiz");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            quiz,
            "Quiz created successfully"
        )
    );
});



const getAllQuizzes = asyncHandler(async (req, res) => {
    
    const quizzes = await db.query(
        "SELECT * FROM Quizzes ORDER BY created_at DESC"
    );
    
    res.status(200).json(
        new ApiResponse(200, quizzes, "Quizzes retrieved successfully")
    );
});



const deleteQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user?.user_id;

    // Use a transaction to delete a quiz and all its related data
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Get the quiz and lock the row for deletion
        const [quiz] = await connection.query(
            "SELECT created_by FROM Quizzes WHERE quiz_id = ? FOR UPDATE",
            [quizId]
        );

        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        // 2. Check ownership
        if (quiz[0].created_by !== userId) {
            throw new ApiError(403, "You are not allowed to delete another admin's data");
        }

        // 3. Delete related data (children before parents)
        // This is safer if ON DELETE CASCADE is not set up.

        // Find and delete SubmittedAnswers (child of QuizAttempts)
        const attempts = await connection.query(
            "SELECT attempt_id FROM QuizAttempts WHERE quiz_id = ?",
            [quizId]
        );
        if (attempts.length > 0) {
            const attemptIds = attempts.map(a => a.attempt_id);
            await connection.query(
                "DELETE FROM SubmittedAnswers WHERE attempt_id IN (?)",
                [attemptIds]
            );
        }
        
        // Delete QuizAttempts (child of Quiz)
        await connection.query("DELETE FROM QuizAttempts WHERE quiz_id = ?", [quizId]);

        // Find and delete Options (child of Questions)
        const questions = await connection.query(
            "SELECT question_id FROM Questions WHERE quiz_id = ?",
            [quizId]
        );
        if (questions.length > 0) {
            const questionIds = questions.map(q => q.question_id);
            await connection.query(
                "DELETE FROM Options WHERE question_id IN (?)",
                [questionIds]
            );
        }

        // Delete Questions (child of Quiz)
        await connection.query("DELETE FROM Questions WHERE quiz_id = ?", [quizId]);

        // 4. Finally, delete the Quiz itself
        await connection.query("DELETE FROM Quizzes WHERE quiz_id = ?", [quizId]);

        // 5. Commit the transaction
        await connection.commit();

        res.status(200).json(
            new ApiResponse(200, { deletedQuizId: quizId }, "Quiz and all related data deleted successfully")
        );

    } catch (error) {
        // 6. Rollback on error
        await connection.rollback();
        // Re-throw for asyncHandler
        throw error;
    } finally {
        // 7. Always release the connection
        connection.release();
    }
});

const submitQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body; // Expecting [{ questionId: X, optionId: Y }, ...]

    // Use user_id from the SQL auth middleware
    const userId = req.user?.user_id; 
    
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new ApiError(400, "Answers are required and should be a non-empty array");
    }

    // 1. Get all questions for the quiz to find the total
    const questions = await db.query(
        "SELECT question_id FROM Questions WHERE quiz_id = ?", 
        [quizId]
    );

    const total = questions.length;
    if (total === 0) {
        throw new ApiError(404, "No questions found for this quiz");
    }

    // 2. Get all *correct* options for this quiz in one query
    const correctOptions = await db.query(
        `SELECT question_id, option_id 
         FROM Options 
         WHERE question_id IN (SELECT question_id FROM Questions WHERE quiz_id = ?) 
         AND is_correct = TRUE`,
        [quizId]
    );

    // 3. Map correct answers for fast lookup: Map<question_id, correct_option_id>
    const correctAnswersMap = new Map(
        correctOptions.map(opt => [opt.question_id, opt.option_id])
    );

    // 4. Calculate score
    let score = 0;
    for (const answer of answers) {
        const { questionId, optionId } = answer;
        
        // Basic validation for each answer object
        if (!questionId || !optionId) {
            console.log(questionId,optionId);
            
            throw new ApiError(400, "Each answer must have a questionId and optionId");
        }

        const correctOptionId = correctAnswersMap.get(parseInt(questionId, 10));
        
        if (correctOptionId === parseInt(optionId, 10)) {
            score++;
        }
    }

    // 5. Use a transaction to save the attempt and the submitted answers
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step A: Insert or update the QuizAttempt
        // This SQL command is the equivalent of "upsert: true"
        await connection.query(
            `INSERT INTO QuizAttempts (user_id, quiz_id, score, totalQuestions, submitted_at)
             VALUES (?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
             score = VALUES(score),
             totalQuestions = VALUES(totalQuestions),
             submitted_at = NOW()`,
            [userId, quizId, score, total]
        );

        // Step B: Get the attempt_id (whether inserted or updated)
        const [attempt] = await connection.query(
            "SELECT attempt_id FROM QuizAttempts WHERE user_id = ? AND quiz_id = ? LIMIT 1",
            [userId, quizId]
        );
        const attemptId = attempt[0].attempt_id;

        // Step C: Clear any previously submitted answers for this attempt
        await connection.query(
            "DELETE FROM SubmittedAnswers WHERE attempt_id = ?",
            [attemptId]
        );

        // Step D: Bulk insert the new submitted answers
        const submittedAnswersValues = answers.map(ans => 
            [attemptId, ans.questionId, ans.optionId]
        );

        if (submittedAnswersValues.length > 0) {
            await connection.query(
                "INSERT INTO SubmittedAnswers (attempt_id, question_id, option_id) VALUES ?",
                [submittedAnswersValues]
            );
        }

        // Step E: Commit the transaction
        await connection.commit();

        // 6. Fetch the final, saved attempt record to return to the user
        const [finalAttempt] = await connection.query(
            "SELECT * FROM QuizAttempts WHERE attempt_id = ?",
            [attemptId]
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                finalAttempt[0],
                "Quiz submitted and results saved successfully"
            )
        );

    } catch (error) {
        // 7. Rollback on error
        await connection.rollback();
        console.error("Quiz submission transaction failed:", error);
        throw new ApiError(500, `Failed to save the quiz attempt: ${error.message}`);
    } finally {
        // 8. Always release the connection
        connection.release();
    }
});



export {
    createQuiz,
    getAllQuizzes,
    deleteQuiz,
    submitQuiz
};