import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/app/lib/prisma";
import { get } from "http";

export async function POST(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const { meeting_id, absent, student_id } = await request.json();
  console.log(meeting_id, absent, student_id);

  try {
    const updateAbsent = await prisma.meeting.update({
      where: { meeting_id },
      data: { absent },
    });

    const getUser = await prisma.user.findFirst({
      where: { user_id: student_id },
    });

    const getCountProgram = await prisma.user.findFirst({
      where: { program_id: getUser?.program_id },
    });

    if (getCountProgram) {
      const updatedCountProgram = getCountProgram.count_program! + 1;

      await prisma.user.update({
        where: {
          user_id: student_id,
          program_id: getCountProgram.program_id,
        },
        data: { count_program: updatedCountProgram },
      });

      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { count_program: updatedCountProgram },
      });
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: updateAbsent,
    });
  } catch (error) {
    console.error("Error updating absent status:", error);
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
