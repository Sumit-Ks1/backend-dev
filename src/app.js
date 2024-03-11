import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // It enables crud operation on cookies of user browser
const app = express();


app.use( cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

// middlewares below (works in between client side and server side)
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"})); 
app.use(express.static("public"));
app.use(cookieParser);

export {app}