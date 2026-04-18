import { Router } from "express";
import { verifyToken } from "../lib/auth";

const userRouter = Router();

userRouter.get('/me', verifyToken, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user,
    });
});



export default userRouter