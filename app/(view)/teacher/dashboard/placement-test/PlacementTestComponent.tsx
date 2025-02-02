import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  Image,
  Modal,
  Typography,
  List,
  Avatar,
  Input,
  Form,
} from "antd";
import { usePlacementTestViewModel } from "./usePlacementTestViewModel";
import { useRandomBgCourse } from "@/app/lib/utils/useRandomBgCourse";
import Link from "next/link";
import { useForm } from "antd/es/form/Form";

const { Title } = Typography;

export default function PlacementTestComponent() {
  const { dataPlacementTest } = usePlacementTestViewModel();

  const backgroundImages = useRandomBgCourse();

  return (
    <div style={{ padding: "24px" }}>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ marginBlock: 0 }}>
          Placement Test
        </Title>
      </Flex>

      <Flex wrap="wrap" gap={16} style={{ marginTop: 16 }}>
        {dataPlacementTest?.data?.map((test, index: number) => (
          <Card
            key={test.placement_test_id}
            cover={
              backgroundImages && (
                <Image
                  alt="default"
                  src={backgroundImages[index % backgroundImages.length]}
                  preview={false}
                />
              )
            }
            actions={[
              <Link
                key={test.placement_test_id}
                href={`/teacher/dashboard/placement-test/${test.placement_test_id}`}
              >
                Detail
              </Link>,
            ]}
            style={{ width: 300 }}
          >
            <Title level={4} style={{ textAlign: "center", marginBottom: 0 }}>
              {test.name}
            </Title>
          </Card>
        ))}
      </Flex>
    </div>
  );
}
