import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadMany(
    messageId: string,
    userId: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can add attachments');
    }

    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

    const saved = await Promise.all(
      files.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          throw new BadRequestException(
            `File "${file.originalname}" exceeds 10MB limit`,
          );
        }

        const uniqueName = `${randomUUID()}-${file.originalname}`;
        const filePath = join(UPLOAD_DIR, uniqueName);
        writeFileSync(filePath, file.buffer);

        return this.prisma.attachment.create({
          data: {
            messageId,
            filename: file.originalname,
            fileUrl: `/uploads/${uniqueName}`,
            mimeType: file.mimetype,
            fileSizeBytes: file.size,
          },
        });
      }),
    );

    return saved;
  }

  async remove(attachmentId: string, messageId: string, userId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, messageId },
      include: { message: { select: { senderId: true } } },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    if (attachment.message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can delete attachments');
    }

    const filePath = join(process.cwd(), attachment.fileUrl);
    if (existsSync(filePath)) unlinkSync(filePath);

    return this.prisma.attachment.delete({ where: { id: attachmentId } });
  }
}
