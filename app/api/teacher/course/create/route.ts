import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    const user_id = user.user_id;

    const generateCode = () => crypto.randomBytes(5).toString("hex");

    const course = await createData("course", {
      name,
      teacher_id: user_id,
      code_course: generateCode(),
    });

    return NextResponse.json({ status: 200, error: false, data: course });
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
