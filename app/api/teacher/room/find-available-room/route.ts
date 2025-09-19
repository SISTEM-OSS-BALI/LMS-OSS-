import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

dayjs.extend(utc);

// ---------- Helpers ----------
const bad = (msg: string, details?: unknown) =>
  NextResponse.json({ error: true, message: msg, details }, { status: 400 });

const ok = (data: unknown) =>
  NextResponse.json({ error: false, data }, { status: 200 });

const toUtcDate = (s: string) =>
  dayjs.utc(s, "YYYY-MM-DD", true).startOf("day"); // strict parse

// "HH:mm" -> minutes since midnight, return null if invalid
function hhmmToMin(s?: string | null): number | null {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// interval overlap helper (minutes)
const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && aEnd > bStart;

// Parse shiftIds from query (?shiftId=a&shiftId=b or CSV)
function parseShiftIds(searchParams: URLSearchParams): string[] {
  const raw = searchParams.getAll("shiftId");
  if (raw.length === 0) {
    const csv = searchParams.get("shiftIds");
    if (csv)
      return csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const single = searchParams.get("shiftId");
    if (single) return [single];
  }
  return raw.flatMap((x) => x.split(",").map((s) => s.trim())).filter(Boolean);
}

/**
 * GET /api/rooms/available?date=YYYY-MM-DD&shiftId=...   (atau start/end)
 *    atau
 * GET ...?date=YYYY-MM-DD&shiftStart=HH:mm&shiftEnd=HH:mm
 *
 * "Room available" = room yang TIDAK digunakan oleh ScheduleBlock yang
 * overlap hari DAN memiliki ScheduleBlockShift dengan:
 *    - shift_id ∈ shiftIds (jika diberikan), ATAU
 *    - jam shiftnya overlap dengan [shiftStart, shiftEnd] (jika diberikan).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);

    // ----- tanggal / rentang -----
    const date = searchParams.get("date");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (startParam && endParam) {
      start = toUtcDate(startParam);
      end = toUtcDate(endParam);
      if (!start.isValid() || !end.isValid()) {
        return bad("Invalid start or end (expect YYYY-MM-DD)");
      }
      if (end.isBefore(start)) return bad("end must be equal or after start");
    } else if (date) {
      const d = toUtcDate(date);
      if (!d.isValid()) return bad("Invalid date (expect YYYY-MM-DD)");
      start = d;
      end = d;
    } else {
      return bad(
        "Provide either ?date=YYYY-MM-DD or ?start=YYYY-MM-DD&end=YYYY-MM-DD"
      );
    }

    // ----- shift by id / by jam -----
    const shiftIds = parseShiftIds(searchParams);
    const shiftStartMin = hhmmToMin(searchParams.get("shiftStart"));
    const shiftEndMin = hhmmToMin(searchParams.get("shiftEnd"));

    if (
      shiftIds.length === 0 &&
      (shiftStartMin === null || shiftEndMin === null)
    ) {
      return bad(
        "Provide shiftId (one or many) OR shiftStart=HH:mm&shiftEnd=HH:mm"
      );
    }
    if (
      shiftStartMin !== null &&
      shiftEndMin !== null &&
      shiftEndMin <= shiftStartMin
    ) {
      return bad("shiftEnd must be after shiftStart (HH:mm)");
    }

    // ----- daftar room -----
    const rooms = await prisma.room.findMany({
      select: { room_id: true, name: true },
      orderBy: { name: "asc" },
    });
    if (rooms.length === 0) return ok([]);

    // ----- ambil block yang overlap hari + times + shift (jam dibaca di TS) -----
    const blocks = await prisma.scheduleBlock.findMany({
      where: {
        start_date: { lte: end.toDate() }, // block starts on/before end
        end_date: { gte: start.toDate() }, // block ends on/after start
        // NOTE: tidak filter shift di DB karena kita juga support overlap by jam
      },
      select: {
        id: true,
        times: {
          select: {
            room_id: true,
            shift_id: true,
            shift: {
              select: {
                start_time: true,
                end_time: true,
              },
            },
          },
        },
      },
    });

    // ----- kumpulkan room yg terpakai dengan filter shift -----
    const occupied = new Set<string>();

    for (const b of blocks) {
      for (const t of b.times) {
        if (!t.room_id) continue;

        // 1) by shift id
        if (shiftIds.length > 0) {
          if (t.shift_id && shiftIds.includes(t.shift_id)) {
            occupied.add(t.room_id);
            continue;
          }
        }

        // 2) by jam overlap
        if (shiftStartMin !== null && shiftEndMin !== null) {
          const s = t.shift?.start_time
            ? dayjs(t.shift.start_time).utc()
            : null;
          const e = t.shift?.end_time ? dayjs(t.shift.end_time).utc() : null;
          if (s && e && s.isValid() && e.isValid()) {
            const sMin = s.hour() * 60 + s.minute();
            const eMin = e.hour() * 60 + e.minute();
            if (overlap(shiftStartMin, shiftEndMin, sMin, eMin)) {
              occupied.add(t.room_id);
            }
          }
        }
      }
    }

    const available = rooms.filter((r) => !occupied.has(r.room_id));
    return ok(available);
  } catch (err: any) {
    console.error("[GET available rooms] error:", err);
    return NextResponse.json(
      { error: true, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
