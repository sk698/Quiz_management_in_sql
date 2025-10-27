import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

//middleware
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js";
import quiz from "./routes/quiz.routes.js";

//default route
app.get("/", (req, res) => {
    res.send("Welcome to Quiz Management System");
})

//routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/quiz", quiz);

// http://localhost:8000/api/v1

export { app };