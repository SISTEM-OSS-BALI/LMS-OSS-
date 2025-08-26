import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const user = await authenticateRequest(request);

  const body = await request.json();

  const { program_id, old_program_id } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const oldUser = await prisma.user.findUnique({
      where: { user_id: params.student_id },
    });
    if (!oldUser) {
      return NextResponse.json(
        { error: true, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (oldUser?.is_active === false) {
      const { user_id, createdAt, ...userData } = oldUser;
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          program_id: program_id,
          is_active: true,
          is_completed: false,
          is_evaluation: false,
          count_program: 0,
          renew_program: true,
          joined_at: dayjs().toDate(),
          // createdAt otomatis
        },
      });

      await prisma.userProgramRenewal.create({
        data: {
          user_id: newUser.user_id,
          old_program_id: old_program_id,
          new_program_id: program_id,
          renew_date: dayjs().toDate(),
        },
      });
      return NextResponse.json({
        status: 200,
        error: false,
        data: newUser,
      });
    } else {
      return NextResponse.json(
        {
          error: true,
          message: "Siswa belum selesai mengikuti program sebelumnya",
        },
        { status: 400 }
      );
    }
  } catch (error) {
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
