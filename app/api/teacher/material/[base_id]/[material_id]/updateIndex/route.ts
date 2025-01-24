import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { material_id: string } }
) {
  const material_id = params.material_id;
  const body = await request.json();
  const { updatedItems } = body;

  if (!Array.isArray(updatedItems)) {
    return NextResponse.json(
      { message: "Invalid input: updatedItems must be an array" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of updatedItems) {
        if (item.type === "text") {
          await tx.materialText.updateMany({
            where: { material_id, contentText: item.value },
            data: { index: item.index },
          });
        } else if (item.type === "url") {
          await tx.materialUrl.updateMany({
            where: { material_id, contentUrl: item.value },
            data: { index: item.index },
          });
        } else if (item.type === "image") {
          await tx.materialImage.updateMany({
            where: { material_id, imageUrl: item.value },
            data: { index: item.index },
          });
        }
      }
    });

    return NextResponse.json(
      { message: "Content order updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating items:", error);
    return NextResponse.json(
      { message: "Failed to update items", error: error },
      { status: 500 }
    );
  }
}
