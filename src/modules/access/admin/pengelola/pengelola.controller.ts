import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        gender: true,
        whatsappNumber: true,
        profileImg: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json(admins);
  } catch (error: unknown) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, gender, whatsappNumber, username } =
      req.body;

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }
    const hashedPassword = await hashPassword(password);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        gender,
        whatsappNumber,
        username: username || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        gender: true,
        whatsappNumber: true,
        profileImg: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      message: 'Admin berhasil ditambahkan.',
      user: newAdmin,
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullName, email, password, gender, whatsappNumber, username } =
      req.body;

    let hashedPassword;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const filteredData = Object.fromEntries(
      Object.entries(req.body).filter(([, value]) => value !== undefined),
    );

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        ...filteredData,
        password: hashedPassword as string,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        gender: true,
        whatsappNumber: true,
        profileImg: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedAdmin);
  } catch (error: any) {
    res.status(500).json({
      message: 'Gagal memperbarui profil admin.',
      error: error.message,
    });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id;
    const deletedAdmin = await prisma.admin.delete({
      where: { id: adminId as string },
    });
    res
      .status(200)
      .json({ message: 'Admin berhasil dihapus.', admin: deletedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus admin.', error });
  }
};

export const deactivateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res
      .status(200)
      .json({ message: 'Akun admin berhasil dinonaktifkan', admin });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan admin.', error });
  }
};

export const activateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.update({
      where: { id: req.params.id as string },
      data: { isActive: true },
    });
    res.status(200).json({ message: 'Akun admin berhasil diaktifkan', admin });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengaktifkan admin.', error });
  }
};
