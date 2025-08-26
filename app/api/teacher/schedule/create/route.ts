// app/api/schedule/month/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

dayjs.extend(utc);

/* ─────────── Helpers ─────────── */
function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}
function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && dayjs(value).isValid();
}
/** 00:00:00.000 UTC */
function normalizeUTCDateMidnight(dateStr: string): Date {
  return dayjs.utc(dateStr).startOf("day").toDate();
}

/* ─────────── POST /api/schedule/month/block ─────────── */
export async function POST(request: NextRequest) {
  let userRes: NextResponse | undefined;
  try {
    const body = await request.json();

    // Auth
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      userRes = user;
      return user;
    }
    const teacher_id = user.user_id as string | undefined;
    if (!teacher_id) return badRequest("teacher_id (from session) is required");

    // Validasi payload
    if (typeof body !== "object" || body === null) {
      return badRequest("Body must be a JSON object");
    }
    const { year, month, block } = body;

    if (
      typeof year !== "number" ||
      !Number.isInteger(year) ||
      year < 1970 ||
      year > 9999
    ) {
      return badRequest("year must be an integer between 1970 and 9999");
    }
    if (
      typeof month !== "number" ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return badRequest("month must be an integer between 1 and 12");
    }

    if (typeof block !== "object" || block === null) {
      return badRequest("block must be an object");
    }

    const {
      color = null,
      start_date,
      end_date,
      shift_ids,
    } = block as {
      color?: string | null;
      start_date: string;
      end_date: string;
      shift_ids: string[];
    };

    if (!isIsoDate(start_date)) {
      return badRequest("block.start_date must be an ISO datetime string");
    }
    if (!isIsoDate(end_date)) {
      return badRequest("block.end_date must be an ISO datetime string");
    }
    if (!Array.isArray(shift_ids) || shift_ids.length < 1) {
      return badRequest("block.shift_ids must be a non-empty array of string");
    }
    if (!shift_ids.every((id) => typeof id === "string" && id.trim().length)) {
      return badRequest("block.shift_ids contains invalid id");
    }

    // Normalisasi tanggal (UTC 00:00)
    const startDate = normalizeUTCDateMidnight(start_date);
    const endDate = normalizeUTCDateMidnight(end_date);
    if (dayjs.utc(endDate).isBefore(dayjs.utc(startDate))) {
      return badRequest("end_date must be the same or after start_date");
    }

    // (Opsional) Peringatan jika range tidak sepenuhnya di (year, month)
    const sY = dayjs.utc(startDate).year();
    const eY = dayjs.utc(endDate).year();
    const sM = dayjs.utc(startDate).month() + 1; // 1..12
    const eM = dayjs.utc(endDate).month() + 1;
    if (sY !== year || eY !== year || sM !== month || eM !== month) {
      console.warn(
        "[ScheduleBlock] Range not strictly within (year, month). Proceeding."
      );
      // Jika mau strict, kembalikan badRequest di sini.
    }

    // Upsert ScheduleMonth
    const monthRecord = await prisma.scheduleMonth.upsert({
      where: {
        teacher_id_year_month: { teacher_id, year, month },
      },
      create: { teacher_id, year, month },
      update: {},
      select: { id: true },
    });

    // Buat block dulu
    const blockRow = await prisma.scheduleBlock.create({
      data: {
        schedule_month_id: monthRecord.id,
        color,
        start_date: startDate,
        end_date: endDate,
      },
      select: { id: true },
    });

    // CreateMany untuk relasi shifts
    if (shift_ids.length > 0) {
      await prisma.scheduleBlockShift.createMany({
        data: shift_ids.map((sid) => ({
          block_id: blockRow.id,
          shift_id: sid,
        })),
        skipDuplicates: true,
      });
    }

    // Ambil kembali block dengan shifts + detail shift schedule
    const created = await prisma.scheduleBlock.findUnique({
      where: { id: blockRow.id },
      include: {
        times: {
          // 'times' di modelmu sekarang adalah ScheduleBlockShift[]
          include: { shift: true }, // join ke ShiftSchedule biar dapat title/start/end
        },
      },
    });

    return NextResponse.json(
      {
        error: false,
        data: {
          schedule_month_id: monthRecord.id,
          block: created,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[ScheduleBlock POST] error:", err);
    // Kalau error dari Prisma karena FK shift_id tidak valid:
    // kamu bisa cek err.code === 'P2003' untuk foreign key violation
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
