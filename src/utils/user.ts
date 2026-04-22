import { prisma } from "../lib/prisma"

export const getUserById = async (userId: string, role: "siswa" | "tutor") => {
    try {
        let user;
        if (role === "siswa") {
            user = await prisma.siswa.findUnique({
                where: {
                    id: userId,
                },
            });
        }

        if (role === "tutor") {
            user = await prisma.tutor.findUnique({
                where: {
                    id: userId,
                },
            });
        }

        return { ...user, role }


    } catch (err: unknown) {
        throw new Error(err as string)
    }
}