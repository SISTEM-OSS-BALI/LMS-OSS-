"use client";

import React, { useState } from "react";
import {
  Card,
  Divider,
  Flex,
  Image,
  Radio,
  Space,
  Input,
  Grid,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import Meta from "antd/es/card/Meta";
import CustomAlert from "@/app/components/CustomAlert";
import Loading from "@/app/components/Loading";
import { useCourseFollowedViewModel } from "./useCourseFollowedViewModel";
import { useRandomBgCourse } from "@/app/lib/utils/useRandomBgCourse";
import { useAuth } from "@/app/lib/auth/authServices";

const { useBreakpoint } = Grid;
const { Title } = Typography;

export default function CoursesFollowedComponent() {
  const screens = useBreakpoint();
  const { courseData, progressData, error } = useCourseFollowedViewModel();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const username = useAuth();
  const router = useRouter();
  const backgroundImages = useRandomBgCourse();

  const handleFilterChange = (e: any) => {
    setFilterStatus(e.target.value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCourses = () => {
    if (!courseData) return [];
    let courses = courseData.data;

    if (filterStatus === "completed") {
      courses = courses.filter((course) => course.completed === true);
    } else if (filterStatus === "not-completed") {
      courses = courses.filter((course) => course.completed === false);
    }

    if (searchTerm) {
      courses = courses.filter((course) =>
        course.course.name.toLowerCase().includes(searchTerm)
      );
    }

    return courses;
  };

  if (error) return <CustomAlert type="error" message={error.message} />;
  if (!courseData) return <Loading />;

  const filteredData = filteredCourses();

  return (
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      {/* 🔹 HEADER */}
      <Flex
        justify="space-between"
        align={screens.xs ? "center" : "start"}
        vertical={screens.xs}
      >
        <Title level={screens.xs ? 5 : 4} style={{ marginBlock: 0 }}>
          Kursus
        </Title>
        <Input
          placeholder="Cari nama kursus"
          onChange={handleSearch}
          style={{ width: screens.xs ? "100%" : 300 }}
        />
      </Flex>

      <Divider />

      {/* 🔹 FILTER BUTTON */}
      <Space
        direction={screens.xs ? "vertical" : "horizontal"}
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Radio.Group
          value={filterStatus}
          onChange={handleFilterChange}
          style={{
            display: "flex",
            justifyContent: screens.xs ? "center" : "flex-start",
            width: "100%",
          }}
        >
          <Radio.Button value="all">Semua</Radio.Button>
          <Radio.Button value="completed">Selesai</Radio.Button>
          <Radio.Button value="not-completed">Belum Selesai</Radio.Button>
        </Radio.Group>
      </Space>

      {/* 🔹 LIST KURSUS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: screens.xs ? "12px" : "16px",
          justifyContent: screens.xs ? "center" : "flex-start",
        }}
      >
        {filteredData.length > 0 ? (
          filteredData.map((enrollment, index) => {
            const firstMaterial =
              enrollment.course.materialsAssigmentBase?.reduce(
                (prev, current) =>
                  new Date(prev.createdAt) < new Date(current.createdAt)
                    ? prev
                    : current,
                enrollment.course.materialsAssigmentBase[0]
              );

            const progress = progressData?.data.find(
              (item) => item.course_id === enrollment.course.course_id
            );

            const currentBaseId =
              progress?.currentMaterialAssigmentBaseId || null;

            const handleCardClick = () => {
              if (currentBaseId) {
                router.push(
                  `/student/dashboard/courses/${enrollment.course.course_id}/materials/${currentBaseId}`
                );
              } else if (firstMaterial) {
                router.push(
                  `/student/dashboard/courses/${enrollment.course.course_id}/materials/${firstMaterial.base_id}`
                );
              }
            };

            return (
              <Card
                key={enrollment.course.course_id}
                style={{
                  width: screens.xs ? "100%" : 300,
                  marginBottom: "12px",
                }}
                onClick={handleCardClick}
                cover={
                  backgroundImages && (
                    <Image
                      alt="default"
                      src={backgroundImages[index % backgroundImages.length]}
                      preview={false}
                      style={{
                        height: screens.xs ? "150px" : "180px",
                        objectFit: "cover",
                      }}
                    />
                  )
                }
                hoverable
              >
                <Meta title={enrollment.course.name} />
              </Card>
            );
          })
        ) : (
          <CustomAlert
            type="info"
            message="Tidak ada modul yang sesuai filter atau pencarian"
          />
        )}
      </div>
    </div>
  );
}
