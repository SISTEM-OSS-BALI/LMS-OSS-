import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 🔹 Ambil semua data partisipan dengan informasi sesi, placement test, dan skor mereka
    const participants = await prisma.placementTestParticipant.findMany({
      include: {
        session: {
          include: {
            placementTest: true, // Mengambil informasi Placement Test
          },
        },
        ScoreFreePlacementTest: true, // Mengambil skor peserta
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
