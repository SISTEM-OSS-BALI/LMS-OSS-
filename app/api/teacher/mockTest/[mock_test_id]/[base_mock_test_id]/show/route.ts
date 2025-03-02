import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { base_mock_test_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // Ambil BaseMockTest berdasarkan ID unik
    const baseMockTest = await prisma.baseMockTest.findUnique({
      where: {
        base_mock_test_id: params.base_mock_test_id,
      },
      include: {
        writing: {
          include: {
            questions: true, // Include Writing Questions
          },
        },
        speaking: true,
        reading: {
          include: {
            questions: true, // Include Reading Questions
          },
        },
        listening: {
          include: {
            questions: true, // Include Listening Questions
          },
        },
      },
    });

    // Jika tidak ditemukan, kembalikan 404
    if (!baseMockTest) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "BaseMockTest tidak ditemukan.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: baseMockTest,
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
