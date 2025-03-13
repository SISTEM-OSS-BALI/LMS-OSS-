import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(request: NextRequest) {
  try {
    // 🔹 Ambil semua data partisipan dengan informasi sesi, placement test, dan skor mereka
    const participants = await prisma.mockTestParticipant.findMany({
      include: {
        session: {
          include: {
            mockTest: true, // Mengambil informasi Placement Test
          },
        },
        ScoreFreeMockTest: true, // Mengambil skor peserta
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: participants,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
