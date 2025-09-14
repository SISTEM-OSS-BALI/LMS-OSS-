import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
dayjs.extend(utc);

// Utils
const bad = (msg: string, details?: unknown) =>
  NextResponse.json({ error: true, message: msg, details }, { status: 400 });

const ok = (data: unknown) =>
  NextResponse.json({ error: false, data }, { status: 200 });

const isYmd = (s: unknown) =>
  typeof s === "string" && dayjs(s, "YYYY-MM-DD", true).isValid();

const toUtcMidnight = (ymd: string) =>
  dayjs.utc(ymd, "YYYY-MM-DD").startOf("day").toDate();

/**
 * PATCH /api/schedule/month/block/:id
 * Body:
 * {
 *   "start": "YYYY-MM-DD",         // inclusive
 *   "endExclusive": "YYYY-MM-DD"   // exclusive (FullCalendar)
 * }
 * - Hanya update tanggal & relokasi ScheduleMonth bila pindah bulan/tahun.
 */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    if (user instanceof NextResponse) return user;
    const teacherId = user.user_id;

    const { id } = ctx.params;
    if (!id) return bad("Missing block id");

    const body = await req.json().catch(() => ({} as any));
    const { start, endExclusive } = body || {};

    if (!isYmd(start)) return bad("start must be YYYY-MM-DD string");
    if (!isYmd(endExclusive))
      return bad("endExclusive must be YYYY-MM-DD string");

    const startInc = toUtcMidnight(start);
    const endInc = dayjs
      .utc(endExclusive, "YYYY-MM-DD")
      .subtract(1, "day")
      .startOf("day")
      .toDate();

    if (dayjs.utc(endInc).isBefore(dayjs.utc(startInc))) {
      return bad("end date must be the same or after start date");
    }

    // Ambil block + month untuk cek kepemilikan
    const block = await prisma.scheduleBlock.findUnique({
      where: { id },
      include: { scheduleMonth: true },
    });
    if (!block) return bad("Block not found", { id });

    if (block.scheduleMonth.teacher_id !== teacherId) {
      return NextResponse.json(
        { error: true, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Target ScheduleMonth
    const targetYear = dayjs.utc(startInc).year();
    const targetMonth = dayjs.utc(startInc).month() + 1;

    let scheduleMonthId = block.schedule_month_id;
    if (
      block.scheduleMonth.year !== targetYear ||
      block.scheduleMonth.month !== targetMonth
    ) {
      const sm = await prisma.scheduleMonth.upsert({
        where: {
          teacher_id_year_month: {
            teacher_id: teacherId,
            year: targetYear,
            month: targetMonth,
          },
        },
        create: { teacher_id: teacherId, year: targetYear, month: targetMonth },
        update: {},
        select: { id: true },
      });
      scheduleMonthId = sm.id;
    }

    const updated = await prisma.scheduleBlock.update({
      where: { id },
      data: {
        schedule_month_id: scheduleMonthId,
        start_date: startInc,
        end_date: endInc,
      },
      include: {
        times: { include: { shift: true, room: true } }, // tampilkan daftar shift + room yang ada
      },
    });

    return ok(updated);
  } catch (err: any) {
    console.error("[PATCH Block] error:", err);
    return NextResponse.json(
      { error: true, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedule/month/block/:id
 * Body:
 * {
 *   "start": "YYYY-MM-DD",
 *   "endExclusive": "YYYY-MM-DD",
 *   "shift_ids": string[]          // daftar ShiftSchedule.id
 * }
 * - Update tanggal & ganti seluruh relasi shift (ScheduleBlockShift).
 */
export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    if (user instanceof NextResponse) return user;
    const teacherId = user.user_id;

    const { id } = ctx.params;
    if (!id) return bad("Missing block id");

    const body = await req.json().catch(() => ({} as any));
    const { start, endExclusive, shift_ids, room_id } = body || {};

    if (!isYmd(start)) return bad("start must be valid YYYY-MM-DD");
    if (!isYmd(endExclusive))
      return bad("endExclusive must be valid YYYY-MM-DD");
    if (
      !Array.isArray(shift_ids) ||
      shift_ids.length < 1 ||
      !shift_ids.every((x) => typeof x === "string")
    ) {
      return bad("shift_ids must be a non-empty array of string");
    }
    if (typeof room_id !== "string" || room_id.trim().length === 0) {
      return bad("room_id is required");
    }

    const startInc = toUtcMidnight(start);
    const endInc = dayjs
      .utc(endExclusive, "YYYY-MM-DD")
      .subtract(1, "day")
      .startOf("day")
      .toDate();

    if (dayjs.utc(endInc).isBefore(dayjs.utc(startInc))) {
      return bad("End date must be after or same as start date");
    }

    const block = await prisma.scheduleBlock.findUnique({
      where: { id },
      include: { scheduleMonth: true },
    });
    if (!block) return bad("Block not found", { id });

    if (block.scheduleMonth.teacher_id !== teacherId) {
      return NextResponse.json(
        { error: true, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Target ScheduleMonth
    const targetYear = dayjs.utc(startInc).year();
    const targetMonth = dayjs.utc(startInc).month() + 1;

    let scheduleMonthId = block.schedule_month_id;
    if (
      block.scheduleMonth.year !== targetYear ||
      block.scheduleMonth.month !== targetMonth
    ) {
      const sm = await prisma.scheduleMonth.upsert({
        where: {
          teacher_id_year_month: {
            teacher_id: teacherId,
            year: targetYear,
            month: targetMonth,
          },
        },
        create: { teacher_id: teacherId, year: targetYear, month: targetMonth },
        update: {},
        select: { id: true },
      });
      scheduleMonthId = sm.id;
    }

    // Validasi referensi: room & shifts
    const [room, shiftsCount] = await Promise.all([
      prisma.room.findUnique({ where: { room_id } }),
      prisma.shiftSchedule.count({ where: { id: { in: shift_ids } } }),
    ]);
    if (!room) return bad("Room not found");
    if (shiftsCount !== shift_ids.length) {
      return bad("One or more shift_ids do not exist");
    }

    // Cek konflik ketersediaan room untuk rentang & shifts baru (kecualikan block ini)
    const conflicts = await prisma.scheduleBlockShift.findMany({
      where: {
        room_id,
        shift_id: { in: shift_ids },
        block: {
          id: { not: id },
          start_date: { lte: endInc },
          end_date: { gte: startInc },
        },
      },
      select: {
        id: true,
        shift_id: true,
        room_id: true,
        block: {
          select: { id: true, start_date: true, end_date: true, schedule_month_id: true },
        },
        shift: { select: { id: true, title: true, start_time: true, end_time: true } },
        room: { select: { room_id: true, name: true } },
      },
    });
    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message:
            "Room is not available for one or more shifts in the requested date range",
          details: { conflicts },
        },
        { status: 409 }
      );
    }

    // Update block + replace semua relasi shift (gunakan transaksi untuk konsistensi)
    const updated = await prisma.$transaction(async (tx) => {
      await tx.scheduleBlock.update({
        where: { id },
        data: {
          schedule_month_id: scheduleMonthId,
          start_date: startInc,
          end_date: endInc,
        },
      });

      await tx.scheduleBlockShift.deleteMany({ where: { block_id: id } });
      if (shift_ids.length > 0) {
        await tx.scheduleBlockShift.createMany({
          data: shift_ids.map((sid: string) => ({
            block_id: id,
            shift_id: sid,
            room_id,
          })),
          skipDuplicates: true,
        });
      }

      return tx.scheduleBlock.findUnique({
        where: { id },
        include: { times: { include: { shift: true, room: true } } },
      });
    });

    return ok(updated);
  } catch (err: any) {
    console.error("[PUT Block] error:", err);
    return NextResponse.json(
      { error: true, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
