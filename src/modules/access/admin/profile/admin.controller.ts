import { Request, Response } from 'express';
import { prisma } from '../../../../lib/prisma';

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    const findAdmin = await prisma.admin.findUnique({
      where: { id: adminId as string },
    });

    if (!findAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({ admin: findAdmin });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { fullName, gender, whatsappNumber, profileImg } = req.body;

    const findAdmin = await prisma.admin.findUnique({
      where: { id: adminId as string },
    });

    if (!findAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId as string },
      data: {
        nama_lengkap: fullName,
        jenis_kelamin: gender,
        nomor_whatsapp: whatsappNumber,
        profile_img: profileImg,
      },
    });

    return res.status(200).json({ admin: updatedAdmin });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
