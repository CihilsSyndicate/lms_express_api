import { prisma } from '../../lib/prisma';
import { comparePassword, generateToken } from '../../lib/auth';
import { UserTokenPayload } from '../../lib/auth';

export class AuthService {
  async login(email: string, password: string) {
    let foundUser: any = null;
    let role: 'siswa' | 'tutor' = 'siswa';

    const siswa = await prisma.siswa.findUnique({ where: { email } });

    if (siswa) {
      const isMatch = await comparePassword(password, siswa.password);
      if (!isMatch) return null;
      foundUser = siswa;
      role = 'siswa';
    } else {
      const tutor = await prisma.tutor.findUnique({ where: { email } });
      if (!tutor) return null;

      const isMatch = await comparePassword(password, tutor.password);
      if (!isMatch) return null;

      foundUser = tutor;
      role = 'tutor';
    }

    const tokenPayload: UserTokenPayload = {
      id: foundUser.id,
      name: foundUser.nama_lengkap,
      email: foundUser.email,
      role,
    };

    const tokens = generateToken(tokenPayload);
    const { password: _, ...userWithoutPassword } = foundUser;

    return {
      user: { ...userWithoutPassword, role },
      role,
      tokens,
    };
  }

  async getCurrentUser(userId: string, role: 'siswa' | 'tutor') {
    let user;
    if (role === 'siswa') {
      user = await prisma.siswa.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.tutor.findUnique({ where: { id: userId } });
    }

    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, role };
  }
}
