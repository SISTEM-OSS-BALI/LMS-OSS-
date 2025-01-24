import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

type ModelName = keyof PrismaClient;

export async function createData<T extends ModelName>(
  model: T,
  data: PrismaClient[T] extends { create: (args: { data: infer D }) => any }
    ? D
    : never
): Promise<
  PrismaClient[T] extends { create: (args: { data: any }) => Promise<infer R> }
    ? R
    : never
> {
  try {
    const modelDelegate = prisma[model];

    if (!modelDelegate) {
      throw new Error(`Model ${String(model)} does not exist.`);
    }

    // Check if 'data' is an array, if so, use 'createMany', otherwise use 'create'
    if (Array.isArray(data)) {
      if (typeof (modelDelegate as any).createMany === "function") {
        // If the model supports 'createMany', use it
        return await (modelDelegate as any).createMany({ data });
      } else {
        throw new Error(
          `Model ${String(model)} does not support 'createMany'.`
        );
      }
    } else {
      if (typeof (modelDelegate as any).create === "function") {
        // If the model supports 'create', use it
        return await (modelDelegate as any).create({ data });
      } else {
        throw new Error(`Model ${String(model)} does not support 'create'.`);
      }
    }
  } catch (error) {
    console.error(`Error creating data in ${String(model)}:`, error);
    throw error;
  }
}
