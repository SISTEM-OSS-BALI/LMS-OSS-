import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PUT(
  request: NextRequest,
  { params }: { params: { program_id: string } }
) {
  const program_id = params.program_id;

  try {
    const body = await request.json();
    const { name, description, count_program, duration } = body;

    const user = await authenticateRequest(request);

    if (user) {
      const updateProgram = await updateData(
        "program",
        { program_id: program_id },
        {
          name,
          description,
          count_program: Number(count_program),
          duration: Number(duration),
        }
      );

      return NextResponse.json({
        status: 200,
        error: false,
        data: updateProgram,
      });
    } else {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
