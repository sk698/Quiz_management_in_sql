import dotenv from "dotenv";
import {connectDB} from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at http://localhost:${process.env.PORT}/api/v1`);
    })
})
.catch((error) => {
    console.log("Database connection failed !!! ", error);
})