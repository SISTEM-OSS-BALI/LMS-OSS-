import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { deleteData } from "@/app/lib/db/deleteData";

export async function DELETE(
  request: NextRequest,
  params: { params: { placement_test_id: string } }
) {
  try {
    const user = await authenticateRequest(request);

    if (user instanceof NextResponse) {
      return user;
    }

    await deleteData("placementTest", {
      placement_test_id: params.params.placement_test_id,
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: "Placement Test deleted successfully",
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
