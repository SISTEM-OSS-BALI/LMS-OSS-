// app/api/schedule/month/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

dayjs.extend(utc);

/* ─────────── Helpers ─────────── */
function badRequest(msg: string, details?: unknown) {
  return NextResponse.json(
    { error: true, message: msg, details },
    { status: 400 }
  );
}
function conflict(msg: string, details?: unknown) {
  return NextResponse.json(
    { error: true, message: msg, details },
    { status: 409 }
  );
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
    const teacher_id = (user as any)?.user_id as string | undefined;
    if (!teacher_id) return badRequest("teacher_id (from session) is required");

    // Validasi payload dasar
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
      room_id,
    } = block as {
      color?: string | null;
      start_date: string;
      end_date: string;
      shift_ids: string[];
      room_id: string;
    };

    // Validasi field block
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
    if (typeof room_id !== "string" || room_id.trim().length === 0) {
      return badRequest("block.room_id is required");
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
      // Jika ingin strict, return badRequest di sini.
    }

    // Validasi referensi: room & shifts
    const [room, shiftsCount] = await Promise.all([
      prisma.room.findUnique({ where: { room_id } }),
      prisma.shiftSchedule.count({ where: { id: { in: shift_ids } } }),
    ]);
    if (!room) return badRequest("Room not found");
    if (shiftsCount !== shift_ids.length) {
      return badRequest("One or more shift_ids do not exist");
    }

    // Cek konflik ketersediaan room:
    // - Cari ScheduleBlockShift lain dengan room yang sama
    // - block overlap (start_date <= endDate && end_date >= startDate)
    // - shift overlap (shift_id ∈ shift_ids yang diajukan)
    const conflicts = await prisma.scheduleBlockShift.findMany({
      where: {
        room_id,
        shift_id: { in: shift_ids },
        block: {
          start_date: { lte: endDate },
          end_date: { gte: startDate },
        },
      },
      select: {
        id: true,
        shift_id: true,
        room_id: true,
        block: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            schedule_month_id: true,
          },
        },
        shift: {
          select: { id: true, title: true, start_time: true, end_time: true },
        },
        room: { select: { room_id: true, name: true } },
      },
    });

    if (conflicts.length > 0) {
      return conflict(
        "Room is not available for one or more shifts in the requested date range",
        {
          conflicts,
        }
      );
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

    // Transaction: buat block + relasi times (dengan room_id)
    const created = await prisma.$transaction(async (tx) => {
      const blockRow = await tx.scheduleBlock.create({
        data: {
          schedule_month_id: monthRecord.id,
          color,
          start_date: startDate,
          end_date: endDate,
        },
        select: { id: true },
      });

      await tx.scheduleBlockShift.createMany({
        data: shift_ids.map((sid) => ({
          block_id: blockRow.id,
          shift_id: sid,
          room_id, // <-- WAJIB: simpan room_id di relasi
        })),
        skipDuplicates: true,
      });

      // kembalikan block lengkap
      return tx.scheduleBlock.findUnique({
        where: { id: blockRow.id },
        include: {
          times: {
            include: {
              shift: true,
              room: true,
            },
          },
        },
      });
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
    // Prisma P2003 = FK violation; P2002 = unique constraint
    return NextResponse.json(
      { error: true, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
