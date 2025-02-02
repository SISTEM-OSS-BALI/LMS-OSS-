import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(
  request: NextRequest,
  params: { params: { placement_test_id: string } }
) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }
  const placement_test_id = params.params.placement_test_id;

  try {
    const getPlacementTest = await getData(
      "placementTest",
      {
        where: {
          placement_test_id: placement_test_id,
        },
      },
      "findUnique"
    );

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
