import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import prisma from "@/lib/prisma";

dayjs.extend(utc);

export async function GET(
  request: NextRequest,
  { params }: { params: { mock_test_id: string } }
) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // ✅ Ambil semua data baseMockTest berdasarkan mock_test_id
    const baseMockTests = await prisma.baseMockTest.findMany({
      where: {
        mock_test_id: params.mock_test_id,
      },
      include: {
        reading: {
          include: { questions: true },
        },
        listening: {
          include: { questions: true },
        },
        speaking: true,
        writing: {
          include: { questions: true },
        },
      },
    });

    // ❌ Jika tidak ada baseMockTest ditemukan
    if (!baseMockTests || baseMockTests.length === 0) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Base Mock Test tidak ditemukan untuk mock_test_id ini.",
      });
    }

    // 🔹 **Format Data Berdasarkan Type**
    const formattedData = baseMockTests.map((baseMockTest) => {
      let baseData: any = {
        base_mock_test_id: baseMockTest.base_mock_test_id,
        mock_test_id: baseMockTest.mock_test_id,
        type: baseMockTest.type,
        createdAt: baseMockTest.createdAt,
      };

      switch (baseMockTest.type) {
        case "READING":
          baseData.reading = baseMockTest.reading;
          break;
        case "LISTENING":
          baseData.listening = baseMockTest.listening;
          break;
        case "SPEAKING":
          baseData.speaking = baseMockTest.speaking;
          break;
        case "WRITING":
          baseData.writing = baseMockTest.writing;
          break;
        default:
          baseData.error = "Jenis Mock Test tidak valid.";
      }

      return baseData;
    });

    const order = {
      READING: 1,
      LISTENING: 2,
      WRITING: 3,
      SPEAKING: 4,
    };

    const sortedData = formattedData.sort(
      (a: { type: keyof typeof order }, b: { type: keyof typeof order }) =>
        order[a.type] - order[b.type]
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: sortedData,
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
