import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  params: { params: { placement_test_id: string } }
) {
  try {
    const getPlacementTest = await prisma.placementTest.findUnique({
      where: {
        placement_test_id: params.params.placement_test_id,
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: getPlacementTest,
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
