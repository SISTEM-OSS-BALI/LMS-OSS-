import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { program_id: string } }
) {
  const program_id = params.program_id;

  try {
    const body = await request.json();
    const { name, description, count_program } = body;

    const user = authenticateRequest(request);

    if (user) {
      const updateProgram = await updateData(
        "program",
        { program_id: program_id },
        { name, description, count_program }
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
