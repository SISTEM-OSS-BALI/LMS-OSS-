/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to retrieve the correct Prisma model
function getPrismaModel(type: "image" | "url" | "text") {
  const prismaMap = {
    image: prisma.materialImage,
    url: prisma.materialUrl,
    text: prisma.materialText,
  };
  return prismaMap[type];
}

// Helper function to shift indices of all types of materials
async function shiftIndicesAfterDelete(material_id: string, fromIndex: number) {
  // Fetch all types of materials that belong to the same material_id
  const allMaterials = await prisma.$transaction([
    prisma.materialImage.findMany({
      where: { material_id },
      orderBy: { index: "asc" },
    }),
    prisma.materialUrl.findMany({
      where: { material_id },
      orderBy: { index: "asc" },
    }),
    prisma.materialText.findMany({
      where: { material_id },
      orderBy: { index: "asc" },
    }),
  ]);

  // Combine all the materials into one list, sorted by their index
  const sortedMaterials = [
    ...allMaterials[0], // materialImage
    ...allMaterials[1], // materialUrl
    ...allMaterials[2], // materialText
  ].sort((a, b) => a.index! - b.index!);

  // Update the indices for materials with a higher index than the deleted one
  for (const material of sortedMaterials) {
    if (material.index! > fromIndex) {
      // Shift the index down by 1
      if ("image_id" in material) {
        await prisma.materialImage.update({
          where: { image_id: material.image_id },
          data: { index: material.index! - 1 },
        });
      } else if ("url_id" in material) {
        await prisma.materialUrl.update({
          where: { url_id: material.url_id },
          data: { index: material.index! - 1 },
        });
      } else if ("text_id" in material) {
        await prisma.materialText.update({
          where: { text_id: material.text_id },
          data: { index: material.index! - 1 },
        });
      }
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { material_id: string } }
) {
  const material_id = params.material_id;
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { type, index } = body;

  if (user instanceof NextResponse) {
    return user;
  }

  if (!type || index === undefined || index === null) {
    return NextResponse.json(
      { error: "Tipe dan indeks diperlukan untuk menghapus elemen" },
      { status: 400 }
    );
  }

  try {
    console.log(
      `Deleting material with material_id: ${material_id}, type: ${type}, index: ${index}`
    );

    // Get the correct model based on the type
    const model = getPrismaModel(type);

    // Use the correct deleteMany method
    const deleteResult = await(model as any).deleteMany({
      where: { material_id, index },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: `No ${type} found to delete` },
        { status: 404 }
      );
    }

    // Shift indices for all materials after deletion
    await shiftIndicesAfterDelete(material_id, index);

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Elemen berhasil dihapus dan indeks diperbarui",
    });
  } catch (error) {
    console.error("Error accessing database:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
