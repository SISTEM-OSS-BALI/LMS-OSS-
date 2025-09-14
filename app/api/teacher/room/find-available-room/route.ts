import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

dayjs.extend(utc);

function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}
function ok(data: any) {
  return NextResponse.json({ status: 200, error: false, data });
}

function toDate(d: string) {
  // simpan & bandingkan pada 00:00 UTC biar konsisten
  return dayjs.utc(d, "YYYY-MM-DD", true).startOf("day");
}

/**
 * Definisi "room occupied" pada rentang:
 * Sebuah room dianggap TERPAKAI bila ada ScheduleBlock yang overlap
 * dengan rentang [start..end] DAN di dalam block itu ada ScheduleBlockShift
 * dengan room_id = room tersebut. (Shift detail tidak mengubah overlap hari.)
 *
 * Overlap hari:  block.start_date <= end  &&  block.end_date >= start
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    // Normalisasi rentang
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (startParam && endParam) {
      start = toDate(startParam);
      end = toDate(endParam);
      if (!start.isValid() || !end.isValid()) {
        return badRequest("Invalid start or end (expect YYYY-MM-DD)");
      }
      if (end.isBefore(start)) {
        return badRequest("end must be equal or after start");
      }
    } else if (date) {
      const d = toDate(date);
      if (!d.isValid()) return badRequest("Invalid date (expect YYYY-MM-DD)");
      start = d;
      end = d;
    } else {
      // fallback: bisa kamu ganti jadi 400 kalau wajib param
      return badRequest(
        "Provide either ?date=YYYY-MM-DD or ?start=YYYY-MM-DD&end=YYYY-MM-DD"
      );
    }

    // Ambil semua room
    const rooms = await prisma.room.findMany({
      select: { room_id: true, name: true },
      orderBy: { name: "asc" },
    });

    if (rooms.length === 0) return ok([]);

    // Cari semua block yang overlap dengan rentang hari
    // (ingat: block.start_date & block.end_date disimpan di UTC 00:00)
    const overlapBlocks = await prisma.scheduleBlock.findMany({
      where: {
        start_date: { lte: end.toDate() }, // block mulai sebelum/di hari end
        end_date: { gte: start.toDate() }, // block berakhir sesudah/di hari start
      },
      select: {
        id: true,
        times: {
          select: { room_id: true }, // ScheduleBlockShift -> room_id
        },
      },
    });

    // Kumpulkan room_id yang terpakai di blok-blok overlap
    const occupiedRoomIds = new Set<string>();
    for (const b of overlapBlocks) {
      for (const t of b.times) {
        if (t.room_id) occupiedRoomIds.add(t.room_id);
      }
    }

    // Filter hanya room yang tidak termasuk occupied
    const available = rooms.filter((r) => !occupiedRoomIds.has(r.room_id));

    return ok(available);
  } catch (error: any) {
    console.error("error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
