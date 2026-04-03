import { RecordType, type Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/apiError';
import { getPagination } from '../../utils/pagination';
import { sendSuccess } from '../../utils/response';

type ImportedRow = {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string;
};

function toRecordType(value: unknown): RecordType | null {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();

  if (normalized === 'INCOME' || normalized === 'INC') {
    return RecordType.INCOME;
  }
  if (normalized === 'EXPENSE' || normalized === 'EXP') {
    return RecordType.EXPENSE;
  }
  return null;
}

function parseDate(value: unknown): Date | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = new Date(String(value ?? ''));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  const normalized = String(value ?? '')
    .trim()
    .replace(/\$/g, '')
    .replace(/,/g, '');

  return Number(normalized);
}

function parseFileRows(file: Express.Multer.File): Record<string, unknown>[] {
  const extension = file.originalname.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'json' || file.mimetype.includes('application/json')) {
    const parsed = JSON.parse(file.buffer.toString('utf-8')) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as Record<string, unknown>[];
    }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { records?: unknown }).records)) {
      return (parsed as { records: Record<string, unknown>[] }).records;
    }
    throw new ApiError(400, 'INVALID_IMPORT_FILE', 'JSON file must be an array of records');
  }

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    throw new ApiError(400, 'INVALID_IMPORT_FILE', 'No sheet found in uploaded file');
  }

  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });
}

function normalizeImportedRows(rows: Record<string, unknown>[]): ImportedRow[] {
  const normalized: ImportedRow[] = [];

  rows.forEach((row, index) => {
    const amount = parseAmount(row.amount ?? row.Amount ?? row.AMOUNT);
    const type = toRecordType(row.type ?? row.Type ?? row.TYPE);
    const category = String(row.category ?? row.Category ?? row.CATEGORY ?? '').trim();
    const date = parseDate(row.date ?? row.Date ?? row.DATE);
    const notesRaw = row.notes ?? row.Notes ?? row.NOTES;

    if (!(amount > 0) || !type || category.length < 2 || !date) {
      throw new ApiError(
        400,
        'INVALID_IMPORT_ROW',
        `Invalid data in import row ${index + 1}. Required: amount>0, type, category, date.`,
      );
    }

    normalized.push({
      amount,
      type,
      category,
      date,
      notes: String(notesRaw ?? '').trim() || undefined,
    });
  });

  return normalized;
}

export async function listRecords(req: Request, res: Response): Promise<void> {
  const { type, category, startDate, endDate, page, limit, search } = req.query as unknown as {
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
    search?: string;
  };

  const { skip, take } = getPagination(page, limit);

  const where: Prisma.FinancialRecordWhereInput = {
    isDeleted: false,
    ...(type ? { type } : {}),
    ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { notes: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  sendSuccess(res, records, 200, { page, limit, total });
}

export async function getRecordById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    include: {
      creator: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!record) {
    throw new ApiError(404, 'NOT_FOUND', 'Record not found');
  }

  sendSuccess(res, record);
}

export async function createRecord(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const record = await prisma.financialRecord.create({
    data: {
      ...req.body,
      createdBy: req.user.id,
    },
  });

  sendSuccess(res, record, 201);
}

export async function updateRecord(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const exists = await prisma.financialRecord.findFirst({ where: { id, isDeleted: false } });
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Record not found');
  }

  const record = await prisma.financialRecord.update({
    where: { id },
    data: req.body,
  });

  sendSuccess(res, record);
}

export async function deleteRecord(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const exists = await prisma.financialRecord.findFirst({ where: { id, isDeleted: false } });
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Record not found');
  }

  await prisma.financialRecord.update({ where: { id }, data: { isDeleted: true } });
  sendSuccess(res, { message: 'Record deleted successfully' });
}

export async function importRecords(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A file is required for import');
  }

  const rows = parseFileRows(file);
  if (rows.length === 0) {
    throw new ApiError(400, 'INVALID_IMPORT_FILE', 'Uploaded file has no rows');
  }

  const normalized = normalizeImportedRows(rows);

  await prisma.$transaction([
    prisma.financialRecord.updateMany({
      where: { isDeleted: false },
      data: { isDeleted: true },
    }),
    prisma.financialRecord.createMany({
      data: normalized.map((row) => ({
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: row.date,
        notes: row.notes,
        createdBy: req.user!.id,
      })),
    }),
  ]);

  sendSuccess(
    res,
    {
      importedCount: normalized.length,
      message: 'Records imported successfully. Previous active records were archived.',
    },
    201,
  );
}
