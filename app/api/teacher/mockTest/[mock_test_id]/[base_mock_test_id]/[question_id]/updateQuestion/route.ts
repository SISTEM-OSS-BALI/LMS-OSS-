import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      mock_test_id: string;
      base_mock_test_id: string;
      question_id?: string;
    };
  }
) {
  try {
    const body = await request.json();
    const { type, passage, prompt, audio_url, question, options, answer } =
      body;
    const { question_id, base_mock_test_id } = params;

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!type || !base_mock_test_id) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal atau BaseMockTest ID tidak valid.",
      });
    }

    // ✅ **Update Prompt untuk Writing**
    if (type === "writing" && prompt) {
      const existingWriting = await prisma.writingMockTest.findUnique({
        where: { base_mock_test_id },
      });

      if (!existingWriting) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Data writing tidak ditemukan.",
        });
      }

      await prisma.writingMockTest.update({
        where: { base_mock_test_id },
        data: { prompt },
      });
    }

    // ✅ **Update Passage untuk Reading**
    else if (type === "reading" && passage) {
      const existingReading = await prisma.readingMockTest.findUnique({
        where: { base_mock_test_id },
      });

      if (!existingReading) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Data reading tidak ditemukan.",
        });
      }

      await prisma.readingMockTest.update({
        where: { base_mock_test_id },
        data: { passage },
      });
    }

    // ✅ **Update Audio untuk Listening**
    else if (type === "listening" && audio_url) {
      const existingListening = await prisma.listeningMockTest.findUnique({
        where: { base_mock_test_id },
      });

      if (!existingListening) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Data listening tidak ditemukan.",
        });
      }

      await prisma.listeningMockTest.update({
        where: { base_mock_test_id },
        data: { audio_url },
      });
    }

    // ✅ **Update Prompt untuk Speaking**
    else if (type === "speaking" && prompt) {
      const existingSpeaking = await prisma.speakingMockTest.findUnique({
        where: { base_mock_test_id },
      });

      if (!existingSpeaking) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Data speaking tidak ditemukan.",
        });
      }

      await prisma.speakingMockTest.update({
        where: { base_mock_test_id },
        data: { prompt },
      });
    }

    // ✅ **Update Soal (Question)**
    else if (question_id && question) {
      let existingQuestion = null;

      if (type === "writing") {
        existingQuestion = await prisma.writingQuestion.findUnique({
          where: { question_id },
        });

        if (existingQuestion) {
          await prisma.writingQuestion.update({
            where: { question_id },
            data: {
              question,
              options: options.length > 0 ? options : existingQuestion.options, // Simpan langsung sebagai array
              answer,
            },
          });
        }
      } else if (type === "reading") {
        existingQuestion = await prisma.readingQuestion.findUnique({
          where: { question_id },
        });

        if (existingQuestion) {
          await prisma.readingQuestion.update({
            where: { question_id },
            data: {
              question,
              options: options.length > 0 ? options : existingQuestion.options, // Simpan langsung sebagai array
              answer,
            },
          });
        }
      } else if (type === "listening") {
        existingQuestion = await prisma.listeningQuestion.findUnique({
          where: { question_id },
        });

        if (existingQuestion) {
          await prisma.listeningQuestion.update({
            where: { question_id },
            data: {
              question,
              options: options.length > 0 ? options : existingQuestion.options, // Simpan langsung sebagai array
              answer,
            },
          });
        }
      }

      if (!existingQuestion) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Soal tidak ditemukan.",
        });
      }
    }

    // ❌ **Jika tipe soal tidak sesuai**
    else {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Tipe soal tidak valid.",
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Soal berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
