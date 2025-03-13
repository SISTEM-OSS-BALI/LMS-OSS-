import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export async function POST(
  request: NextRequest,
  { params }: { params: { mock_test_id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, email, institution, grade, socialMedia, phone } = body;

    if (
      !fullName ||
      !email ||
      !institution ||
      !grade ||
      !socialMedia ||
      !phone
    ) {
      return new NextResponse(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { mock_test_id } = params;

    // Set tanggal hari ini ke format yang konsisten (tanpa jam)
    const today = dayjs.utc().startOf("day");

    // Cek apakah sudah ada sesi untuk Placement Test ini di hari ini
    let session = await prisma.mockTestSession.findFirst({
      where: {
        mockTestId: mock_test_id,
        sessionDate: today.toDate(),
      },
    });

    // Jika sesi belum ada, buat sesi baru untuk hari ini
    if (!session) {
      session = await prisma.mockTestSession.create({
        data: {
          mockTestId: mock_test_id,
          sessionDate: today.toDate(),
        },
      });
    }

    // Cek apakah peserta sudah terdaftar dalam sesi ini (hindari duplikasi)
    const existingParticipant = await prisma.mockTestParticipant.findFirst(
      {
        where: {
          sessionId: session.session_id,
          email, // Email unik untuk setiap sesi
        },
      }
    );

    if (existingParticipant) {
      return new NextResponse(
        JSON.stringify({
          error: "You have already registered for today's session",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Simpan data peserta ke sesi ini
    const newParticipant = await prisma.mockTestParticipant.create({
      data: {
        sessionId: session.session_id,
        name: fullName,
        email,
        phone: phone,
        institution,
        grade,
        social_media: socialMedia,
      },
    });

    return NextResponse.json({
      status: 201,
      error: false,
      message: "Successfully registered for the mock test",
      data: newParticipant,
    });
  } catch (error) {
    console.error("Error registering participant:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
