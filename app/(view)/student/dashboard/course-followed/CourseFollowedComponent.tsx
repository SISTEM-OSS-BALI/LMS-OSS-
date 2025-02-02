import React, { useState } from "react";
import { Card, Divider, Flex, Image, Radio, Space, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import Meta from "antd/es/card/Meta";
import CustomAlert from "@/app/components/CustomAlert";
import Loading from "@/app/components/Loading";
import Title from "antd/es/typography/Title";
import randomBgCourse from "@/app/lib/utils/useRandomBgCourse";
import { useUsername } from "@/app/lib/auth/useLogin";
import generateCertificate from "@/app/lib/utils/generateCertificate";
import { formatDate } from "@/app/lib/utils/formatDate";
import { useCourseFollowedViewModel } from "./useCourseFollowedViewModel";

export default function CoursesFollowedComponent() {
  const { courseData, progressData, error } = useCourseFollowedViewModel();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const username = useUsername();
  const router = useRouter();
  const backgroundImages = randomBgCourse();

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

  const handleGenerateCertificate = (
    courseName: string,
    completionDate: any
  ) => {
    generateCertificate(
      username,
      courseName,
      formatDate(completionDate),
      "/assets/images/certificate.png"
    );
  };

  if (error) return <CustomAlert type="error" message={error.message} />;
  if (!courseData) return <Loading />;

  const filteredData = filteredCourses();

  return (
    <div>
      <Flex justify="space-between">
        <Title level={4} style={{ marginBlock: 0 }}>
          Kursus yang diikuti
        </Title>
        <Input
          placeholder="Cari nama kursus"
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </Flex>
      <Divider />
      <Space direction="vertical" style={{ width: "100%" }}>
        <Radio.Group
          value={filterStatus}
          onChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="all">Semua</Radio.Button>
          <Radio.Button value="completed">modul yang diselesaikan</Radio.Button>
          <Radio.Button value="not-completed">
            modul yang belum diselesaikan
          </Radio.Button>
        </Radio.Group>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
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
                  style={{ width: 300, margin: 20 }}
                  onClick={handleCardClick}
                  cover={
                    <Image
                      alt="default"
                      src={backgroundImages[index % backgroundImages.length]}
                      preview={false}
                    />
                  }
                  hoverable
                >
                  <Meta
                    title={enrollment.course.name}
                    description={enrollment.course.teacher.username}
                  />
                  {progress?.completed && (
                    <>
                      <Divider />
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateCertificate(
                            enrollment.course.name,
                            progress.createdAt
                          );
                        }}
                      >
                        Cetak Sertifikat
                      </Button>
                    </>
                  )}
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
      </Space>
    </div>
  );
}
