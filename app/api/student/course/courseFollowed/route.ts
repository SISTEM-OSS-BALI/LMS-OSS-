import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const user_id = user.user_id;

    const courseFollowed = await prisma.courseEnrollment.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        course: {
          include: {
            teacher: true,
            materialsAssigmentBase: {
              include: {
                materials: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: 200,
      error: false,
      data: courseFollowed,
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
