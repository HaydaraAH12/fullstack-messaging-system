import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type TableName = keyof PrismaService;

interface GetTableDataParams {
  table: string;
  columns?: string[];
  limit?: number;
  offset?: number;
}

@Injectable()
export class GetTableDataService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly forbiddenTables: string[] = [
    '_prisma_migrations',
    'auditLogs',
  ];

  async getTableData({ table, columns, limit, offset }: GetTableDataParams) {
    if (this.forbiddenTables.includes(table)) {
      throw new BadRequestException(`Access to table "${table}" is forbidden`);
    }

    if (!(table in this.prisma)) {
      throw new BadRequestException(`Table "${table}" does not exist`);
    }

    const model = this.prisma[table as keyof PrismaService] as any;

    const queryOptions: {
      select?: Record<string, boolean>;
      take?: number;
      skip?: number;
    } = {};

    if (columns && columns.length > 0) {
      queryOptions.select = columns.reduce<Record<string, boolean>>(
        (acc, col) => {
          acc[col] = true;
          return acc;
        },
        {},
      );
    }

    if (typeof limit === 'number') {
      queryOptions.take = limit;
    }

    if (typeof offset === 'number') {
      queryOptions.skip = offset;
    }

    return model.findMany(queryOptions);
  }
}
