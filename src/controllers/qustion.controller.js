import db from "../db/db.js"; // Import the SQL db helper
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addQuestionToQuiz = asyncHandler(async (req, res) => {

    const { quizId } = req.params;
    
    
    


    const [quiz] = await db.query(
        "SELECT * FROM Quizzes WHERE quiz_id = ? LIMIT 1", 
        [quizId]
    );

    if(!quiz){
        throw new ApiError(404, "Quiz not found");
    }

    if(quiz.created_by != req.user?.user_id){
        throw new ApiError(403, "You are not allowed to modify another admin's data")
    }

    let questiondata = req.body;
    

    if(!Array.isArray(questiondata)){
        questiondata = [questiondata];
    }

    if (!questiondata || questiondata.length === 0) {
        throw new ApiError(400, "Question is required");
    }


    const createdQuestion = [];

    const connection = await db.pool.getConnection();

    try {
        // Start a transaction
        await connection.beginTransaction();

        for (const q of questiondata) {
            const { text, options } = q;            
            if (!text || !options || !Array.isArray(options) || options.length < 2) {
                // Rollback if any question is invalid
                await connection.rollback();
                throw new ApiError(400, "Each question must have text and at least two options");
            }

            // 3. Insert the Question
            const [questionResult] = await connection.query(
                "INSERT INTO Questions (quiz_id, text) VALUES (?, ?)",
                [quizId, text]
            );

            
            const questionId = questionResult.insertId;
            if (!questionId) {
                // Rollback if question insert fails
                await connection.rollback();
                throw new ApiError(500, "Failed to create question");
            }

            
            

            // 4. Prepare and insert Options
            const optionsValues = options.map(opt => [
                questionId,
                opt.text,
                opt.isCorrect || false
            ]);

            await connection.query(
                "INSERT INTO Options (question_id, text, is_correct) VALUES ?",
                [optionsValues] // Bulk insert options
            );

            // Add the created question to the response array
            createdQuestion.push({
                question_id: questionId,
                text,
                options
            });
        }

        // 5. Commit the transaction if all questions/options were added
        await connection.commit();

    } catch (error) {
        // 6. Rollback on any error
        await connection.rollback();
        // Re-throw the error to be caught by asyncHandler
        throw new ApiError(500, `Failed to add question(s): ${error.message}`);
    } finally {
        // 7. Always release the connection
        connection.release();
    }


    const responseData = createdQuestion.length === 1 ? createdQuestion[0] : createdQuestion;

    return res.status(201).json(
        new ApiResponse(
            201,
            responseData,
            "Question(s) added to quiz successfully"
        )
    );

});

const getAllQuestions = asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    const questions = await db.query(
        "SELECT question_id, text FROM Questions WHERE quiz_id = ? ORDER BY created_at ASC",
        [quizId]
    );

    if (!questions.length) {
        throw new ApiError(404, "No questions found for this quiz");
    }

    const questionIds = questions.map(q => q.question_id);

    // 3. Get all options for those questions in a single query
    //    We only select non-sensitive fields (no is_correct)
    const options = await db.query(
        "SELECT option_id, question_id, text FROM Options WHERE question_id IN (?)",
        [questionIds]
    );

    // 4. Map options to their respective questions in memory
    const optionsMap = new Map();
    options.forEach(opt => {
        if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
        }
        optionsMap.get(opt.question_id).push({
            option_id: opt.option_id,
            text: opt.text
        });
    });

    // 5. Combine questions with their options
    const responseData = questions.map(q => ({
        question_id: q.question_id,
        text: q.text,
        options: optionsMap.get(q.question_id) || [] // Ensure empty array if no options
    }));

    res.status(200).json(
        new ApiResponse(200, questions, "Questions retrieved successfully")
    );
});

export { 
    addQuestionToQuiz,
    getAllQuestions,
};