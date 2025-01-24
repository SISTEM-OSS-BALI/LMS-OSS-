import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

type ModelName = keyof PrismaClient;

export async function deleteData<T extends ModelName>(
  model: T,
  where: PrismaClient[T] extends { delete: (args: { where: infer W }) => any }
    ? W
    : never
): Promise<
  PrismaClient[T] extends { delete: (args: { where: any }) => Promise<infer R> }
    ? R
    : never
> {
  try {
    const modelDelegate = prisma[model];

    if (!modelDelegate || typeof (modelDelegate as any).delete !== "function") {
      throw new Error(`Model ${String(model)} does not have a delete method.`);
    }

    return await (modelDelegate as any).delete({ where });
  } catch (error) {
    console.error(`Error deleting data from ${String(model)}:`, error);
    throw error;
  }
}
