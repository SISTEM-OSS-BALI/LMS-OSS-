import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { name, description, count_program, duration } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const createProgram = await createData("program", {
      name,
      description,
      count_program: Number(count_program),
      duration: Number(duration),
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: createProgram,
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
