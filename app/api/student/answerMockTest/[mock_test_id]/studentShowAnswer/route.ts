import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";

// Interface untuk response API
interface StudentAnswerMockTest {
  answer_id: string;
  student_id: string;
  mock_test_id: string;
  base_mock_test_id: string;
  studentAnswer?: string | null;
  recording_url?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
  submittedAt: string;

  readingQuestion?: {
    question_id: string;
    question: string;
    options?: string[];
    answer?: string;
  } | null;

  listeningQuestion?: {
    question_id: string;
    question: string;
    options?: string[];
    answer?: string;
    audio_url?: string; // ✅ Tambahkan URL Audio Listening
  } | null;

  writingQuestion?: {
    question_id: string;
    question: string;
  } | null;

  speakingTest?: {
    speaking_id: string;
    prompt: string;
  } | null;

  // ✅ Tambahkan Passage untuk Reading
  readingPassage?: {
    passage: string;
  } | null;

  baseMockTest?: {
    reading?: {
      passage: string;
    } | null;
  } | null;

  // ✅ Tambahkan Prompt untuk Writing & Speaking
  writingPrompt?: {
    prompt: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { mock_test_id: string } }
) {
  const mock_test_id = params.mock_test_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // 🔹 Ambil semua jawaban siswa berdasarkan `mock_test_id`
    const studentAnswers: StudentAnswerMockTest[] = await getData(
      "studentAnswerMockTest",
      {
        where: {
          mock_test_id: mock_test_id,
          student_id: user.user_id, // Hanya mengambil jawaban siswa yang sedang login
        },
        include: {
          readingQuestion: true,
          listeningQuestion: {
            include: { listening: true }, // ✅ Ambil audio_url Listening
          },
          writingQuestion: {
            include: { writing: true }, // ✅ Ambil prompt Writing
          },
          speakingTest: true, // ✅ Ambil prompt Speaking
          baseMockTest: {
            include: {
              reading: true, // ✅ Ambil passage Reading
            },
          },
        },
      },
      "findMany"
    );

    // 🔹 Format data agar lebih lengkap
    const formattedData = studentAnswers.map((entry) => ({
      ...entry,
      // ✅ Tambahkan passage dari soal Reading jika ada
      readingPassage: entry.baseMockTest?.reading
        ? { passage: entry.baseMockTest.reading.passage }
        : null,

      // ✅ Tambahkan prompt dari soal Writing jika ada
      writingPrompt: entry.writingQuestion
        ? { prompt: entry.writingQuestion.question }
        : null,

      // ✅ Tambahkan audio URL dari soal Listening jika ada
      listeningQuestion: entry.listeningQuestion
        ? {
            ...entry.listeningQuestion,
            audio_url: entry.listeningQuestion.audio_url ?? null,
          }
        : null,
    }));

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
