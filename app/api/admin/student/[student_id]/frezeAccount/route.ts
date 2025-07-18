import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const user = await authenticateRequest(request);

  const body = await request.json();

  const { is_active } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    await prisma.user.update({
      where: {
        user_id: params.student_id,
      },
      data: {
        is_active: is_active,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "success",
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
