import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      mock_test_id: string;
      base_mock_test_id: string;
      question_id: string;
    };
  }
) {
  try {
    const { question_id, base_mock_test_id } = params;

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!question_id || !base_mock_test_id) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "ID soal atau BaseMockTest ID tidak valid.",
      });
    }

    let deletedQuestion = null;

    // ✅ **Hapus Soal dari Writing, Reading, atau Listening**
    deletedQuestion = await prisma.writingQuestion.deleteMany({
      where: { question_id },
    });

    if (!deletedQuestion.count) {
      deletedQuestion = await prisma.readingQuestion.deleteMany({
        where: { question_id },
      });
    }

    if (!deletedQuestion.count) {
      deletedQuestion = await prisma.listeningQuestion.deleteMany({
        where: { question_id },
      });
    }

    // ✅ **Hapus Prompt untuk Speaking**
    if (!deletedQuestion.count) {
      const existingSpeaking = await prisma.speakingMockTest.findUnique({
        where: { base_mock_test_id },
      });

      if (existingSpeaking) {
        await prisma.speakingMockTest.deleteMany({
          where: { speaking_id: question_id },
        });

        return NextResponse.json({
          status: 200,
          error: false,
          message: "Prompt speaking berhasil dihapus.",
        });
      }
    }

    if (!deletedQuestion.count) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Soal tidak ditemukan atau sudah dihapus.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Soal berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error deleting question:", error);

    if (error.code === "P2025") {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "Soal tidak ditemukan atau sudah dihapus.",
      });
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
