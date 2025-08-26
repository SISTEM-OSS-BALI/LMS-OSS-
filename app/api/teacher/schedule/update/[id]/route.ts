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
        times: { include: { shift: true } }, // tampilkan daftar shift yang ada
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
    const { start, endExclusive, shift_ids } = body || {};

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

    // Update block + replace semua relasi shift
    const updated = await prisma.scheduleBlock.update({
      where: { id },
      data: {
        schedule_month_id: scheduleMonthId,
        start_date: startInc,
        end_date: endInc,
        times: {
          deleteMany: {}, // hapus semua ScheduleBlockShift lama
          create: shift_ids.map((sid: string) => ({ shift_id: sid })), // buat relasi baru
        },
      },
      include: { times: { include: { shift: true } } },
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
