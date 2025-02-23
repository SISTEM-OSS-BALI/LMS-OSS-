import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { updateData } from "@/app/lib/db/updateData";

export async function PUT(
  request: NextRequest,
  params: { params: { base_placement_test_id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    const user = authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    await updateData(
      "basePlacementTest",
      { base_id: params.params.base_placement_test_id },
      {
        name,
      }
    );

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Placement Test updated",
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
