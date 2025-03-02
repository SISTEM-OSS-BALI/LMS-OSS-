import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { updateData } from "@/app/lib/db/updateData";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignment_id: string } }
) {
  const assignment_id = params.assignment_id;

  try {
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { timeLimit } = body.payload;

    if (!timeLimit) {
      return NextResponse.json(
        { error: "Waktu diperlukan dalam permintaan" },
        { status: 400 }
      );
    }

    const assignment = await getData(
      "assignment",
      { where: { assignment_id } },
      "findUnique"
    );

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment tidak ditemukan" },
        { status: 404 }
      );
    }

   const updatedAssignment = await updateData(
     "assignment",
     { assignment_id: assignment_id },
     { timeLimit }
   );
    return NextResponse.json({
      status: 200,
      error: false,
      data: updatedAssignment,
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
