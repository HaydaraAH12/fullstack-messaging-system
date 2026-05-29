import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageFolder, type SidebarItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SidebarMoveDirection } from './dto/move-sidebar-item.dto';

@Injectable()
export class SidebarService {
  constructor(private readonly prisma: PrismaService) {}

  async getSidebar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roleId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const items = await this.prisma.sidebarItem.findMany({
      where: {
        isActive: true,
        OR: [{ roleId: null }, { roleId: user.roleId }],
      },
      orderBy: { position: 'asc' },
    });

    const folders = items
      .map((i: SidebarItem) => i.folder)
      .filter((f): f is MessageFolder => f !== null);

    const [folderCounts, inboxUnreadCount] = await Promise.all([
      folders.length
        ? this.prisma.messageRecipient.groupBy({
            by: ['folder'],
            where: {
              recipientId: userId,
              deletedAt: null,
              folder: { in: folders },
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      this.prisma.messageRecipient.count({
        where: {
          recipientId: userId,
          folder: MessageFolder.INBOX,
          isRead: false,
          deletedAt: null,
        },
      }),
    ]);

    const countByFolder = new Map(
      folderCounts.map((r) => [r.folder, r._count._all]),
    );

    return {
      items: items.map((item: SidebarItem) => {
        const base = {
          id: item.id,
          key: item.key,
          name: item.name,
          icon: item.icon,
          folder: item.folder,
          position: item.position,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };

        if (!item.folder) {
          return { ...base, count: 0 };
        }

        const count = countByFolder.get(item.folder) ?? 0;
        if (item.folder === MessageFolder.INBOX) {
          return { ...base, count, unreadCount: inboxUnreadCount };
        }

        return { ...base, count };
      }),
    };
  }

  async moveItem(
    userId: string,
    itemId: string,
    direction: SidebarMoveDirection,
  ) {
    const items = await this.prisma.sidebarItem.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new NotFoundException('Sidebar item not found');
    }

    const targetIndex =
      direction === SidebarMoveDirection.UP ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) {
      throw new BadRequestException('Cannot move item further in that direction');
    }

    const current = items[index];
    const adjacent = items[targetIndex];

    await this.prisma.$transaction([
      this.prisma.sidebarItem.update({
        where: { id: current.id },
        data: { position: adjacent.position },
      }),
      this.prisma.sidebarItem.update({
        where: { id: adjacent.id },
        data: { position: current.position },
      }),
    ]);

    return this.getSidebar(userId);
  }
}
