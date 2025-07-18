import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/authUtils";
import prisma from "@/lib/prisma";
import { Certificate, Section, SectionType } from "@prisma/client";
import { get } from "http";

interface GroupMember {
  user_id: string;
  username: string | null;
  no_phone: string | null;
  // is_evaluation: boolean | null;
  sections: {
    level: string;
    section_type: SectionType;
    comment: string;
    student_id: string | null;
    user_group_id: string | null;
  }[];
}

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (user instanceof NextResponse) return user;

  try {
    const getStudent = await prisma.user.findFirst({
      where: { user_id: user.user_id },
    });

    if (!getStudent) {
      return NextResponse.json({
        status: 404,
        error: true,
        message: "User not found",
      });
    }

    let certificateData: Certificate[] | null = null;
    let studentName = getStudent.username ?? getStudent.name_group ?? "Unknown";
    let groupMembers: GroupMember[] = [];

    if (getStudent.type_student === "GROUP") {
      const userGroups = await prisma.userGroup.findMany({
        where: { userUser_id: getStudent.user_id },
      });

      if (!userGroups || userGroups.length === 0) {
        return NextResponse.json({
          status: 404,
          error: true,
          message: "Group not found for this user",
        });
      }

      const allGroupMembers: GroupMember[] = [];

      for (const group of userGroups) {
        const groupId = group.user_group_id;

        const userGroupId = group.userUser_id;

        // Ambil certificate hanya dari grup pertama
        if (!certificateData) {
          certificateData = await prisma.certificate.findMany({
            where: { student_id: userGroupId },
            include: {
              student: true,
            }
          });
        }

        const members = await prisma.userGroup.findMany({
          where: {
            user_group_id: groupId,
          },
          select: {
            user_group_id: true,
            username: true,
            no_phone: true,
            userUser_id: true,
            // is_evaluation: true,
          },
        });

        const sections = await prisma.section.findMany({
          where: { user_group_id: groupId },
          select: {
            section_type: true,
            level: true,
            comment: true,
            student_id: true,
            user_group_id: true,
          },
        });

        const mappedMembers: GroupMember[] = members.map((member) => ({
          user_id: member.userUser_id ?? "",
          username: member.username,
          user_group_id: member.user_group_id,
          no_phone: member.no_phone,
          certificate: certificateData?.find(
            (cert: any) => cert.user_group_id === member.user_group_id
          ),

          sections: sections.filter(
            (section) => section.user_group_id === member.user_group_id
          ),
        }));

        allGroupMembers.push(...mappedMembers);

        studentName = getStudent.name_group ?? "Unknown";
      }

      groupMembers = allGroupMembers;
    } else {
      // INDIVIDUAL
      const cert = await prisma.certificate.findFirst({
        where: { student_id: getStudent.user_id },
      });
      certificateData = cert ? [cert] : null;
    }

    const getProgram = await prisma.program.findUnique({
      where: { program_id: getStudent.program_id ?? undefined },
    });

    const sections = await prisma.section.findMany({
      where: { student_id: getStudent.user_id },
      select: {
        section_type: true,
        level: true,
        comment: true,
        student_id: true,
      },
    });

    let mergedData;

    if (getStudent.type_student === "GROUP") {
      mergedData = {
        program_name: getProgram?.name ?? null,
        student_name: getStudent.name_group ?? "Unknown",
        group_members: getStudent.type_student === "GROUP" ? groupMembers : [],
      };
    } else {
      mergedData = {
        certificateData,
        user_id: getStudent.user_id,
        program_name: getProgram?.name ?? null,
        student_name: studentName,
        sections: sections.find(
          (section) => section.student_id === getStudent.user_id
        ),
      };
    }

    return NextResponse.json({
      status: 200,
      error: false,
      data: mergedData,
    });
  } catch (error) {
    console.error("Error accessing certificate/group data:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
