import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";


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
    const getMaterialBase = await getData("material", {
      where: {
        base_id: base_id,
      },
      include: {
        images: {
          orderBy: { index: "asc" },
        },
        urls: {
          orderBy: { index: "asc" },
        },
        texts: {
          orderBy: { index: "asc" },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }, "findFirst");

    return NextResponse.json({
      status: 200,
      error: false,
      data: getMaterialBase,
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
