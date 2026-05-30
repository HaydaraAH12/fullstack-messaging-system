import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDatumDto: any) {
    return 'This action adds a new userDatum';
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      omit: {
        passwordHash: true,
      },
    });
    return users;
  }

  /** Compose autocomplete — email + display name only (no user ids). */
  async searchDirectory(query: string, excludeUserId: string) {
    const term = query.trim();
    if (term.length < 2) {
      return [];
    }

    const tokens = term
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    return this.prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: excludeUserId },
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          { username: { contains: term, mode: 'insensitive' } },
          { fullName: { contains: term, mode: 'insensitive' } },
          ...(tokens.length > 1
            ? [
                {
                  AND: tokens.map((t) => ({
                    fullName: { contains: t, mode: 'insensitive' as const },
                  })),
                },
              ]
            : []),
        ],
      },
      select: {
        email: true,
        fullName: true,
      },
      take: 10,
      orderBy: { email: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: {
        passwordHash: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return {
      message: `User ${updatedUser.fullName} updated successfully`,
      updatedFields: Object.keys(dto),
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User ${user.fullName} deleted successfully`,
    };
  }
}
