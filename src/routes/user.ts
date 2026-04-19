import { Router } from "express";
import { verifyToken } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { getUserById } from "../utils/user";


const userRouter = Router();

userRouter.get('/me', verifyToken, async (req, res) => {

    const user = await getUserById(req?.user?.id as string, req?.user?.role as "siswa" | "tutor");

    res.json({
        message: 'This is a protected route',
        user: user,
    });
});



export default userRouter