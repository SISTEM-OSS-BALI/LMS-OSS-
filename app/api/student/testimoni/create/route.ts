import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await request.json();
  const {
    lesson_satisfaction,
    teaching_method_effectiveness,
    exercise_and_assignment_relevance,
    material_relevance,
    teacher_identity,
    teaching_delivery,
    teacher_attention,
    teacher_ethics,
    teacher_motivation,
    class_experience,
    favorite_part,
    improvement_suggestions,
  } = body;

  try {
    await createData("testimoni", {
      student_id: user.user_id,
      lesson_satisfaction,
      teaching_method_effectiveness,
      exercise_and_assignment_relevance,
      material_relevance,
      teacher_identity,
      teaching_delivery,
      teacher_attention,
      teacher_ethics,
      teacher_motivation,
      class_experience,
      favorite_part,
      improvement_suggestions,
    });

    await prisma.certificate.updateMany({
      where: {
        student_id: user.user_id,
      },
      data: {
        is_complated_testimoni: true,
      },
    });

    const getCertificate = await prisma.certificate.findFirst({
      where: {
        student_id: user.user_id,
      },
      select: {
        is_complated_meeting: true,
        is_complated_testimoni: true,
      },
    });

    if (
      getCertificate?.is_complated_meeting &&
      getCertificate.is_complated_testimoni == true
    ) {
      await prisma.certificate.updateMany({
        where: {
          student_id: user.user_id,
        },
        data: {
          is_download: true,
        },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Success",
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
  }
}
