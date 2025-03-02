import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/app/lib/db/getData";
import { authenticateRequest } from "@/app/lib/auth/authUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { base_placement_test_id: string } }
) {
  const user = await authenticateRequest(request);

  if (user instanceof NextResponse) {
    return user;
  }

  try {
    const basePlacementTestId = params.base_placement_test_id;

    const nameBase = await prisma.basePlacementTest.findUnique({
      where: { base_id: basePlacementTestId },
      select: {
        name:true
      }
    });

    // Fetch semua jenis test secara paralel
    const [multipleChoiceTests, trueFalseTests, writingTests] =
      await Promise.all([
        getData(
          "multipleChoicePlacementTest",
          {
            where: { basePlacementTestId },
          },
          "findMany"
        ),

        getData(
          "trueFalseGroupPlacementTest",
          {
            where: { basePlacementTestId },
            include: { trueFalseQuestions: true }, // Include pertanyaan True/False
          },
          "findMany"
        ),

        getData(
          "writingPlacementTest",
          {
            where: { basePlacementTestId },
          },
          "findMany"
        ),
      ]);

    return NextResponse.json({
      status: 200,
      error: false,
      data: {
        name: nameBase,
        multipleChoice: multipleChoiceTests,
        trueFalse: trueFalseTests,
        writing: writingTests,
      },
    });
  } catch (error) {
    console.error("Error accessing database:", error);
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
