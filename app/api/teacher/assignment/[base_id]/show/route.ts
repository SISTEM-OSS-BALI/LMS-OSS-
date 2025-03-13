import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: { base_id: string } }
) {
  const base_id = params.base_id;
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    // Query untuk mendapatkan semua assignment dengan base_id
    const assignments = await getData(
      "assignment",
      {
        where: {
          base_id: base_id,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          multipleChoices: true,
          essay: true,
        },
      },
      "findMany"
    );

    // Transform data dinamis sesuai dengan tipe
    const formattedAssignments = assignments.map((assignment: any) => {
      let typeData = null;

      if (assignment.type === "MULTIPLE_CHOICE" && assignment.multipleChoices) {
        typeData = {
          type: "MULTIPLE_CHOICE",
          details: assignment.multipleChoices,
        };
      } else if (assignment.type === "ESSAY" && assignment.essay) {
        typeData = {
          type: "ESSAY",
          details: assignment.essay,
        };
      }

      return {
        assignment_id: assignment.assignment_id,
        description: assignment.description,
        timeLimit: assignment.timeLimit,
        createdAt: assignment.createdAt,
        base_id: assignment.base_id,
        typeData,
      };
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: formattedAssignments,
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
