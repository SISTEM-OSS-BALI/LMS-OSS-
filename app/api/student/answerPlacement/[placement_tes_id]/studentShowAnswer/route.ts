import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";

// Definisi tipe data
interface StudentAnswer {
  answer_id: string;
  student_id: string;
  placement_test_id: string;
  mcq_id?: string | null;
  group_id?: string | null;
  tf_id?: string | null;
  writing_id?: string | null;
  studentAnswer: string;
  isCorrect?: boolean | null;
  score: number;
  submittedAt: string;
  multipleChoice?: {
    mc_id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  } | null;
  trueFalseQuestion?: {
    tf_id: string;
    question: string;
    correctAnswer: boolean;
  } | null;
  writingQuestion?: {
    writing_id: string;
    question: string;
  } | null;
}

interface TrueFalseGroup {
  group_id: string;
  passage: string;
  trueFalseQuestions: {
    tf_id: string;
    question: string;
    correctAnswer: boolean;
  }[];
}

export async function GET(
  request: NextRequest,
  params: { params: { placement_tes_id: string } }
) {
  const placement_tes_id = params.params.placement_tes_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // 🔹 Ambil semua jawaban siswa dari StudentAnswerPlacementTest
    const studentAnswers: StudentAnswer[] = await getData(
      "studentAnswerPlacementTest",
      {
        where: {
          placement_test_id: placement_tes_id,
          student_id: user.user_id,
        },
        include: {
          multipleChoice: true,
          trueFalseQuestion: true, // Hanya pertanyaan yang dijawab siswa
          writingQuestion: true,
        },
      },
      "findMany"
    );

    // 🔹 Ambil daftar unique group_id dari studentAnswers
    const uniqueGroupIds = Array.from(
      new Set(
        studentAnswers
          .map((answer) => answer.group_id)
          .filter((groupId): groupId is string => !!groupId) // Hapus nilai null dan undefined
      )
    );

    // 🔹 Jika ada `group_id`, ambil data TrueFalseGroupPlacementTest
    const trueFalseGroups: TrueFalseGroup[] = uniqueGroupIds.length
      ? await getData(
          "trueFalseGroupPlacementTest",
          {
            where: { group_id: { in: uniqueGroupIds } },
            include: { trueFalseQuestions: true },
          },
          "findMany"
        )
      : [];

    // 🔹 Gabungkan `trueFalseGroup` hanya ke jawaban yang sesuai
    const formattedData = studentAnswers.map((answer) => {
      const group = trueFalseGroups.find((g) => g.group_id === answer.group_id);

      return {
        ...answer,
        trueFalseGroup: group
          ? {
              ...group,
              trueFalseQuestions: group.trueFalseQuestions.filter(
                (question) => question.tf_id === answer.tf_id
              ),
            }
          : null,
      };
    });

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
