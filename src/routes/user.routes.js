import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// When the user goes to register page then it will do below work
router.route("/register").post(registerUser);  // The router.route() method creates a new route for a specific path. The .post() method specifies that this route handler will only respond to HTTP POST requests. The registerUser function (or middleware) is the callback that will be executed when an HTTP POST request is made to the “/register” path.

export default router