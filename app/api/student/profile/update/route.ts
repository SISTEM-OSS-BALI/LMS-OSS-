import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";

export async function PUT(request: NextRequest) {
  const user = await authenticateRequest(request);

  const body = await request.json();
  const { username, email, no_phone } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    await updateData(
      "user",
      { user_id: user.user_id },
      { username, email, no_phone }
    );

    return NextResponse.json({ status: 200, error: false, data: "Success" });
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
