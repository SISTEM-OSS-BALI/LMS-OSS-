/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      base_id,
      course_id,
      type,
      questions,
      question,
      pairs,
      timeLimit,
      description,
    } = body;

    const user = authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    // Validasi base_id dan type
    if (!base_id || !type) {
      return NextResponse.json(
        { error: "Base ID dan tipe assignment diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah base_id valid dan milik course yang benar
    const base = await getData(
      "materialAssigmentBase",
      {
        where: { base_id },
      },
      "findUnique"
    );

    if (!base || base.course_id !== course_id) {
      return NextResponse.json(
        { error: "MaterialAssignmentBase tidak valid" },
        { status: 400 }
      );
    }

    // Cari assignment berdasarkan base_id
    let assignment = await prisma.assignment.findFirst({
      where: { base_id },
    });

    if (!assignment) {
      // Jika assignment tidak ada, buat yang baru
      assignment = await prisma.assignment.create({
        data: {
          description,
          timeLimit: Number(timeLimit),
          base_id,
          type,
        },
      });
    }

    // Penanganan soal berdasarkan tipe assignment
    if (type === "MULTIPLE_CHOICE") {
      if (!questions || !Array.isArray(questions)) {
        return NextResponse.json(
          { error: "Pertanyaan Multiple Choice diperlukan" },
          { status: 400 }
        );
      }

      // Tambahkan data baru ke assignment multiple choice yang sudah ada
      const multipleChoiceData = questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        assignment_id: assignment.assignment_id,
      }));

      await prisma.multipleChoice.createMany({
        data: multipleChoiceData,
      });
    } else if (type === "ESSAY") {
      if (!question) {
        return NextResponse.json(
          { error: "Pertanyaan esai diperlukan" },
          { status: 400 }
        );
      }

      // Tambahkan data esai baru ke assignment
      await createData("essay", {
        question,
        assignment_id: assignment.assignment_id,
      });
    } else if (type === "SENTENCE_MATCHING") {
      if (!pairs || !Array.isArray(pairs)) {
        return NextResponse.json(
          { error: "Pasangan pertanyaan dan jawaban diperlukan" },
          { status: 400 }
        );
      }

      // Temukan atau buat sentence matching
      let sentenceMatching = await prisma.sentenceMatching.findFirst({
        where: { assignment_id: assignment.assignment_id },
      });

      if (!sentenceMatching) {
        sentenceMatching = await createData("sentenceMatching", {
          assignment_id: assignment.assignment_id,
        });
      }

      // Tambahkan pasangan baru ke sentence matching
      const pairData = pairs.map((p: any) => ({
        question: p.question,
        correctAnswer: p.correctAnswer,
        matching_id: sentenceMatching.matching_id,
      }));

      await prisma.pair.createMany({
        data: pairData,
      });
    } else {
      return NextResponse.json(
        { error: "Tipe assignment tidak dikenal" },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: 200, error: false, data: assignment });
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
