"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Layout,
  Menu,
  Progress,
  Divider,
  Button,
  notification,
  ConfigProvider,
  message,
  Image,
} from "antd";
import Loading from "@/app/components/Loading";
import CustomAlert from "@/app/components/CustomAlert";
import MultipleChoiceAssignment from "@/app/components/MultipleChoiceAssigment";
import Icon, { CheckCircleTwoTone } from "@ant-design/icons";
import { useMaterialViewModel } from "./useMaterialViewModel";
import { Header } from "antd/es/layout/layout";
import { BackIcon, NextIcon } from "@/app/components/Icon";
import { primaryColor } from "@/app/lib/utils/colors";
import ReactPlayer from "react-player";

const { Content, Sider, Footer } = Layout;

export default function ShowMaterial() {
  const query = useParams();
  const router = useRouter();
  const base_id = query.base_id as string;
  const course_id = query.course_id as string;

  const {
    materialError,
    pointMutate,
    assignmentError,
    materialBaseError,
    progressMaterialData,
    progressCourseMutate,
    progressMaterialMutate,
    handleNext,
    nextIndex,
    material,
    assignment,
    pointStudent,
    materialBases,
    progressCourse,
  } = useMaterialViewModel(base_id, course_id);

  if (materialError || assignmentError || materialBaseError) {
    return (
      <CustomAlert
        type="error"
        message={
          materialError?.message ||
          assignmentError?.message ||
          materialBaseError?.message
        }
      />
    );
  }


  const renderAssignment = () => {
    if (!assignment) {
      return <Loading />;
    }

    return assignment.map((assignment: any, index: number) => {
      if (assignment.typeData.type === "MULTIPLE_CHOICE") {
        return (
          <MultipleChoiceAssignment
            key={assignment.assignment_id}
            description={assignment.description}
            base_id={base_id}
            course_id={course_id}
            assignment_id={assignment.assignment_id}
            timeLimit={assignment.timeLimit}
            mutate={pointMutate}
            pointStudent={pointStudent!}
            data={assignment.typeData.details.map((detail: any) => ({
              mcq_id: detail.mcq_id,
              question: detail.question,
              options: detail.options,
              correctAnswer: detail.correctAnswer,
            }))}
            onComplete={async () => {
              await progressCourseMutate();
              await progressMaterialMutate();
            }}
          />
        );
      }
    });
  };


  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: primaryColor,
            triggerBg: "white",
            triggerColor: "black",
            footerBg: "white",
          },
          Menu: {
            colorBgContainer: "white",
            colorText: "black",
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Header style={{ background: "#fff", padding: "0 20px" }}>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push(`/student/dashboard/course-followed`)}
          >
            <Icon component={BackIcon} style={{ marginRight: "8px" }} />
            Halaman Utama
          </Button>
        </Header>
        <Layout>
          <Content style={{ margin: "20px", background: "#fff" }}>
            {!material && !assignment && <Loading />}
            {material && (
              <div style={{ marginBottom: "20px" }}>
                {[
                  ...material.texts.map((textItem) => ({
                    type: "text",
                    value: textItem.contentText,
                    index: textItem.index,
                  })),
                  ...material.urls.map((urlItem) => ({
                    type: "url",
                    value: urlItem.contentUrl,
                    index: urlItem.index,
                  })),
                  ...material.images.map((imageItem) => ({
                    type: "image",
                    value: imageItem.imageUrl,
                    index: imageItem.index,
                  })),
                ]
                  .sort((a, b) => a.index! - b.index!)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "20px",
                        marginTop: "20px",
                        paddingLeft: 200,
                        paddingRight: 200,
                      }}
                    >
                      {item.type === "text" && (
                        <div
                          dangerouslySetInnerHTML={{ __html: item.value ?? "" }}
                          style={{
                            padding: "10px",
                            background: "#fff",
                            textAlign: "justify",
                          }}
                        />
                      )}
                      {item.type === "url" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {ReactPlayer.canPlay(item.value!) ? (
                            <ReactPlayer
                              url={item.value}
                              controls
                              width={700}
                              height={500}
                            />
                          ) : (
                            <a
                              href={item.value}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.value}
                            </a>
                          )}
                        </div>
                      )}
                      {item.type === "image" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            src={item.value}
                            alt="Image"
                            height={500}
                            style={{ maxWidth: "100%" }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div>{renderAssignment()}</div>
          </Content>

          <Sider
            width={350}
            style={{
              background: "#fff",
              paddingRight: "30px",
              paddingLeft: "30px",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                padding: "10px",
                background: "#ffff",
                borderRadius: "5px",
              }}
            >
              <h1>Progress</h1>
              <Progress
                percent={progressCourse?.progress ?? 0}
                status="active"
                showInfo={true}
                strokeColor="#4CAF50"
              />
            </div>
            <Divider />
            <h2>Daftar Materi</h2>
            <Menu
              mode="inline"
              selectedKeys={[base_id]}
              onClick={({ key }) =>
                router.push(
                  `/student/dashboard/courses/${course_id}/materials/${key}`
                )
              }
            >
              {materialBases!.map((base) => {
                const isCompleted = progressMaterialData?.data.some(
                  (progress: any) =>
                    progress.base_id === base.base_id && progress.completed
                );
                return (
                  <Menu.Item
                    key={base.base_id}
                    icon={
                      isCompleted ? (
                        <CheckCircleTwoTone
                          style={{ color: "green", marginRight: 10 }}
                        />
                      ) : null
                    }
                  >
                    {base.title}
                  </Menu.Item>
                );
              })}
            </Menu>
          </Sider>
        </Layout>
        <Footer
          style={{
            background: "#fff",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button type="default" size="large" onClick={() => router.back()}>
            <Icon component={BackIcon} style={{ marginRight: "8px" }} />
            Kembali
          </Button>
          {(pointStudent?.completed === true || pointStudent === null) && (
            <Button type="default" onClick={handleNext} size="large">
              {nextIndex < materialBases!.length ? (
                <span>
                  {materialBases![nextIndex].title}
                  <Icon component={NextIcon} style={{ marginLeft: "8px" }} />
                </span>
              ) : (
                <span>Selesaikan Course</span>
              )}
            </Button>
          )}
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
