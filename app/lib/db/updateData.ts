import prisma from "../../../lib/prisma";
import { PrismaClient } from "@prisma/client";

type ModelName = keyof PrismaClient;

export async function updateData<T extends ModelName>(
  model: T,
  where: Record<string, any>,
  data: Record<string, any>
): Promise<any> {
  try {
    const modelDelegate = prisma[String(model) as keyof typeof prisma];

    if (!modelDelegate || typeof (modelDelegate as any).update !== "function") {
      throw new Error(`Model ${String(model)} does not have an update method.`);
    }

    return await (modelDelegate as any).update({ where, data });
  } catch (error) {
    console.error(`Error updating data in ${String(model)}:`, error);
    throw error;
  }
}
