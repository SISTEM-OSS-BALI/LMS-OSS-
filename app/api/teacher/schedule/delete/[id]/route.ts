import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    // Pastikan id ada
    if (!id) {
      return NextResponse.json(
        { status: 400, error: true, message: "ID jadwal tidak diberikan" },
        { status: 400 }
      );
    }

    await prisma.scheduleBlock.delete({
      where: { id },
    });

    return NextResponse.json(
      { status: 200, error: false, data: "Jadwal berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ScheduleMonth DELETE]", error);
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: error?.message || "Terjadi kesalahan saat menghapus jadwal",
      },
      { status: 500 }
    );
  }
}
