import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function PATCH(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { user_id, target, consultant_id } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    await prisma.user.update({
      where: {
        user_id: user_id,
      },
      data: {
        target,
        consultant_id,
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
