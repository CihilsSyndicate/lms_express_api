import { Request, Response } from 'express';
import { getStudyRoomDataService } from './study-room.service';

export const getStudyRoomData = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;
    const siswaId = req.user?.id;

    if (!modulId) {
      return res.status(400).json({ message: 'modulId wajib diisi.' });
    }

    const payload = await getStudyRoomDataService(
      modulId as string,
      siswaId as string,
    );
    res.status(200).json(payload);
  } catch (error: any) {
    console.error('[STUDY-ROOM-ERROR]', error);
    if (error.message === 'Modul tidak ditemukan') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Anda belum terdaftar di modul ini') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Internal server error saat mengambil data study room.',
    });
  }
};
