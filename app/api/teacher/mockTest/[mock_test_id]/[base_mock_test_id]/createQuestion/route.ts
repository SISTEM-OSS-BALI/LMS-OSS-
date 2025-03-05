import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(
  request: NextRequest,
  { params }: { params: { base_mock_test_id: string } }
) {
  try {
    const body = await request.json();
    const { type, mock_test_id, questions, prompt, passage, audio_url } = body;

    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!type || !mock_test_id || !questions || questions.length === 0) {
      return NextResponse.json({
        status: 400,
        error: true,
        message: "Data tidak lengkap atau format tidak valid.",
      });
    }

    let createdMockTest;

    // 🔹 **Writing Section**
    if (type === "writing") {
      if (!prompt) {
        return NextResponse.json({
          status: 400,
          error: true,
          message: "Prompt untuk writing wajib diisi.",
        });
      }

      createdMockTest = await createData("writingMockTest", {
        base_mock_test_id: params.base_mock_test_id,
        prompt,
      });

      for (const questionObj of questions) {
        const { question, options, correctAnswer } = questionObj;

        await createData("writingQuestion", {
          writing_id: createdMockTest.writing_id,
          question,
          options,
          answer: correctAnswer,
        });
      }
    }

    // 🔹 **Reading Section**
    else if (type === "reading") {
      if (!passage) {
        return NextResponse.json({
          status: 400,
          error: true,
          message: "Passage untuk reading wajib diisi.",
        });
      }

      createdMockTest = await createData("readingMockTest", {
        base_mock_test_id: params.base_mock_test_id,
        passage,
      });

      for (const questionObj of questions) {
        const { question, options, correctAnswer } = questionObj;

        await createData("readingQuestion", {
          reading_id: createdMockTest.reading_id,
          question,
          options,
          answer: correctAnswer,
        });
      }
    }

    // 🔹 **Listening Section**
    else if (type === "listening") {
      if (!audio_url) {
        return NextResponse.json({
          status: 400,
          error: true,
          message: "Audio URL untuk listening wajib diisi.",
        });
      }

      createdMockTest = await createData("listeningMockTest", {
        base_mock_test_id: params.base_mock_test_id,
        audio_url,
      });

      for (const questionObj of questions) {
        const { question, options, correctAnswer } = questionObj;

        await createData("listeningQuestion", {
          listening_id: createdMockTest.listening_id,
          question,
          options,
          answer: correctAnswer,
        });
      }
    }

    // 🔹 **Speaking Section**
    else if (type === "speaking") {
      if (!prompt) {
        return NextResponse.json({
          status: 400,
          error: true,
          message: "Prompt untuk speaking wajib diisi.",
        });
      }

      await createData("speakingMockTest", {
        base_mock_test_id: params.base_mock_test_id,
        prompt,
      });
    }

    // Jika tipe tidak valid
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
      message: "Soal berhasil dibuat",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
