import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base_id, contentItems } = body;

    // Authenticate the request
    const user = await authenticateRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    if (!base_id || !contentItems || !Array.isArray(contentItems)) {
      return NextResponse.json(
        { error: "base_id and contentItems are required" },
        { status: 400 }
      );
    }

    // Check for existing material
    let material = await getData(
      "material",
      {
        where: { base_id },
      },
      "findFirst"
    );

    if (!material) {
      // Create a new material if none exists
      material = await createData("material", { base_id });
    }

    // Insert content items
    for (const item of contentItems) {
      const { type, value, index } = item;

      switch (type) {
        case "image":
          await prisma.materialImage.create({
            data: {
              material_id: material.material_id,
              imageUrl: value,
              index: index,
            },
          });
          break;
        case "url":
          await prisma.materialUrl.create({
            data: {
              material_id: material.material_id,
              contentUrl: value,
              index: index,
            },
          });
          break;
        case "text":
          await prisma.materialText.create({
            data: {
              material_id: material.material_id,
              contentText: value,
              index: index,
            },
          });
          break;
        default:
          console.warn(`Unknown content type: ${type}`);
          continue;
      }
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: material,
    });
  } catch (error) {
    console.error("Error creating or updating material:", error);
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
