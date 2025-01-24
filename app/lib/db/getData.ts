import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

type ModelName = keyof PrismaClient;

type FindMethod = "findUnique" | "findFirst" | "findMany";

export async function getData<T extends ModelName>(
  model: T,
  options: Record<string, any> = {},
  method: FindMethod = "findMany"
): Promise<any | null> {
  try {
    const modelDelegate = prisma[model];

    if (
      !modelDelegate ||
      typeof (modelDelegate as any)[method] !== "function"
    ) {
      throw new Error(
        `Model ${String(model)} does not support the method ${method}.`
      );
    }

    return await (modelDelegate as any)[method](options);
  } catch (error) {
    console.error(`Error saat mengambil data dari ${String(model)}:`, error);
    throw error;
  }
}
