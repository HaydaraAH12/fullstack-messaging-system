import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { MessagesService } from './messages.service';
import { AttachmentsService } from './attachments.service';
import { MessageFolder } from '@prisma/client';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth-grade';
import { SendMessageDto } from './dto/send-message.dto';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    id: string;
  };
  isMultipart?: () => boolean;
  parts?: () => AsyncIterable<any>;
  body?: Record<string, unknown>;
};

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  @Post()
  async send(@Request() req: AuthenticatedRequest) {
    const { dto, files } = await this.extractSendPayload(req);
    const message = await this.messagesService.sendMessage(req.user.id, dto);

    if (files.length) {
      await this.attachmentsService.uploadMany(message.id, req.user.id, files);
    }

    return this.messagesService.findMessageById(message.id, req.user.id);
  }

  @Get()
  getFolder(
    @Request() req: AuthenticatedRequest,
    @Query('folder') folder: MessageFolder = MessageFolder.INBOX,
  ) {
    return this.messagesService.getFolder(req.user.id, folder);
  }

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.findMessageById(id, req.user.id);
  }

  @Get(':id/thread')
  getThread(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.getThread(id, req.user.id);
  }

  @Patch(':id/star')
  toggleStar(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.toggleStar(id, req.user.id);
  }

  @Patch(':id/archive')
  archiveMessage(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.archiveMessage(id, req.user.id);
  }

  @Delete(':id')
  moveToTrash(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.moveToTrash(id, req.user.id);
  }

  @Post(':id/attachments')
  async uploadAttachments(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const files = await this.extractFilesOnly(req);
    if (!files.length) {
      throw new BadRequestException('No files provided');
    }
    return this.attachmentsService.uploadMany(id, req.user.id, files);
  }

  private async extractSendPayload(req: AuthenticatedRequest): Promise<{
    dto: SendMessageDto;
    files: Express.Multer.File[];
  }> {
    if (!req.isMultipart || !req.isMultipart() || !req.parts) {
      const dto = req.body as SendMessageDto;
      return { dto, files: [] };
    }

    const files: Express.Multer.File[] = [];
    const fields: Record<string, string> = {};

    for await (const part of req.parts()) {
      if (part.type === 'file') {
        files.push(await this.toMulterFile(part));
        continue;
      }

      fields[part.fieldname] = String(part.value ?? '');
    }

    const dto = this.parseSendMessageFields(fields);
    return { dto, files };
  }

  private async extractFilesOnly(
    req: AuthenticatedRequest,
  ): Promise<Express.Multer.File[]> {
    if (!req.isMultipart || !req.isMultipart() || !req.parts) {
      return [];
    }

    const files: Express.Multer.File[] = [];
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        files.push(await this.toMulterFile(part));
      }
    }
    return files;
  }

  private async toMulterFile(part: any): Promise<Express.Multer.File> {
    const buffer: Buffer = await part.toBuffer();
    return {
      fieldname: part.fieldname,
      originalname: part.filename,
      encoding: part.encoding ?? '7bit',
      mimetype: part.mimetype ?? 'application/octet-stream',
      size: buffer.length,
      buffer,
      destination: '',
      filename: part.filename,
      path: '',
      stream: part.file,
    } as Express.Multer.File;
  }

  private parseSendMessageFields(
    fields: Record<string, string>,
  ): SendMessageDto {
    const subject = (fields.subject ?? '').trim();
    const body = (fields.body ?? '').trim();

    if (!subject) throw new BadRequestException('subject is required');
    if (!body) throw new BadRequestException('body is required');
    if (!fields.recipients) {
      throw new BadRequestException('recipients is required');
    }

    let recipients: unknown;
    try {
      recipients = JSON.parse(fields.recipients);
    } catch {
      throw new BadRequestException('recipients must be a valid JSON array');
    }

    return {
      subject,
      body,
      recipients: recipients as SendMessageDto['recipients'],
      parentMessageId: fields.parentMessageId || undefined,
    };
  }

  @Delete(':id/attachments/:attachmentId')
  deleteAttachment(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ) {
    return this.attachmentsService.remove(attachmentId, messageId, req.user.id);
  }
}
