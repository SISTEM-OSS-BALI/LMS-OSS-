/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import { createData } from "@/app/lib/db/createData";
import { getData } from "@/app/lib/db/getData";
import { NextRequest, NextResponse } from "next/server";

// Function to shift indices up starting from a given index
async function shiftIndices(material_id: any, type: string, fromIndex: any) {
  switch (type) {
    case "image":
      await prisma.materialImage.updateMany({
        where: { material_id, index: { gte: fromIndex } },
        data: { index: { increment: 1 } },
      });
      break;
    case "url":
      await prisma.materialUrl.updateMany({
        where: { material_id, index: { gte: fromIndex } },
        data: { index: { increment: 1 } },
      });
      break;
    case "text":
      await prisma.materialText.updateMany({
        where: { material_id, index: { gte: fromIndex } },
        data: { index: { increment: 1 } },
      });
      break;
  }
}

// Function to create a new content item
async function createNewItem(
  type: string,
  value: string,
  index: number,
  material_id: string
) {
  switch (type) {
    case "image":
      await createData("materialImage", {
        material_id,
        imageUrl: value,
        index,
      });
      break;
    case "url":
      await createData("materialUrl", {
        material_id,
        contentUrl: value,
        index,
      });
      break;
    case "text":
      await createData("materialText", {
        material_id,
        contentText: value,
        index,
      });
      break;
  }
}

// Update content item if it already exists
async function updateExistingContentItem(
  type: string,
  newValue: string,
  index: number,
  material_id: string
) {
  switch (type) {
    case "image":
      await prisma.materialImage.updateMany({
        where: { material_id, index },
        data: { imageUrl: newValue },
      });
      break;
    case "url":
      await prisma.materialUrl.updateMany({
        where: { material_id, index },
        data: { contentUrl: newValue },
      });
      break;
    case "text":
      await prisma.materialText.updateMany({
        where: { material_id, index },
        data: { contentText: newValue },
      });
      break;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { base_id: string; material_id: string } }
) {
  const material_id = params.material_id;
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { base_id, contentItems } = body;

  const updatedContentItems = contentItems.map((item: any, index: any) => {
    if (index === 0) {
      return item; // Keep the first item as is
    } else {
      item.index = contentItems[0].index + index; // Increment index for subsequent items
      return item;
    }
  });

  if (user instanceof NextResponse) {
    return user;
  }

  if (!base_id || !contentItems || !Array.isArray(contentItems)) {
    return NextResponse.json(
      { error: "base_id dan contentItems diperlukan" },
      { status: 400 }
    );
  }

  try {
    // Fetch the existing material
    const existingMaterial = await getData(
      "material",
      {
        where: { material_id, base_id },
        include: { images: true, urls: true, texts: true },
      },
      "findUnique"
    );

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update the base_id of the material
    await prisma.material.update({ where: { material_id }, data: { base_id } });

    // Create a map for easier reference to existing items
    const existingItemsMap = new Map();
    existingMaterial.images.forEach((img: any) => {
      existingItemsMap.set(`image:${img.index}`, img.imageUrl);
    });
    existingMaterial.urls.forEach((url: any) => {
      existingItemsMap.set(`url:${url.index}`, url.contentUrl);
    });
    existingMaterial.texts.forEach((text: any) => {
      existingItemsMap.set(`text:${text.index}`, text.contentText);
    });

    // Track the indexes to check for duplicates
    const seenIndexes = new Set();

    // Loop through the updated contentItems
    for (const item of updatedContentItems) {
      const { type, value, index } = item;

      // Ensure the value isn't null or undefined
      if (value == null || value === "") {
        return NextResponse.json(
          { error: `Invalid value provided for ${type} at index ${index}` },
          { status: 400 }
        );
      }

      // Check if the index has already been seen
      const uniqueKey = `${type}:${index}`;
      if (seenIndexes.has(uniqueKey)) {
        // If it's already seen, just create the new item since the index will be unique at this point
        await createNewItem(type, value, index, material_id);
      } else {
        // Check if an item already exists at the specified index and type
        if (existingItemsMap.has(uniqueKey)) {
          const existingValue = existingItemsMap.get(uniqueKey);

          // Update only if the value has changed
          if (existingValue !== value) {
            await updateExistingContentItem(type, value, index, material_id);
          }
        } else {
          // If the item doesn't exist, we need to shift existing items for all types
          await shiftIndices(material_id, "text", index); // Shift text
          await shiftIndices(material_id, "image", index); // Shift images
          await shiftIndices(material_id, "url", index); // Shift URLs

          // Insert the new content at the specified index
          await createNewItem(type, value, index, material_id);
        }
      }

      // Add this index to the seenIndexes to track duplicates
      seenIndexes.add(uniqueKey);
    }

    return NextResponse.json({
      status: 200,
      error: false,
      message: "Data berhasil diperbarui",
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
