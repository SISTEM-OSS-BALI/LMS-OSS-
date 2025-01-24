import { NextRequest, NextResponse } from "next/server";

import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  const user_id = user.user_id;
  try {
    const getCourses = await getData(
      "course",
      {
        where: {
          teacher_id: user_id,
        },
        include: {
          students: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      "findMany"
    );

    return NextResponse.json({ status: 200, error: false, data: getCourses });
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
