import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AccessCourse,
  AccessMockTest,
  AccessPlacementTest,
  Course,
  MockTest,
  PlacementTest,
} from "@prisma/client";

dayjs.extend(utc);

interface UserResponse {
  data: User[];
}

interface PlacementTestResponse {
  data: PlacementTest[];
}

interface AccessPlacementTestResponse {
  data: AccessPlacementTest[];
}

interface AccessCourseResponse {
  data: AccessCourse[];
}

interface CourseResponse {
  data: Course[];
}

interface AccessMockTestResponse {
  data: AccessMockTest[];
}

interface MockTestResponse {
  data: MockTest[];
}

export const useMeetings = () => {
  const router = useRouter();
  const { data: showMeetingById } = useSWR(
    "/api/student/meeting/showById",
    fetcher
  );
  const { data: dataTeacher } = useSWR<UserResponse>(
    "/api/admin/teacher/show",
    fetcher
  );

  const { data: countPogramData } = useSWR(
    "/api/student/countProduct",
    fetcher
  );

  const { data: accessPlacemenetTestData } =
    useSWR<AccessPlacementTestResponse>(
      "/api/student/placementTest/show",
      fetcher
    );

  const { data: accessCourseData } = useSWR<AccessCourseResponse>(
    "/api/student/accessCourse/show",
    fetcher
  );

  const { data: placemenetTestData } = useSWR<PlacementTestResponse>(
    "/api/teacher/placementTest/show",
    fetcher
  );

  const { data: courseData } = useSWR<CourseResponse>(
    "/api/student/course/show",
    fetcher
  );

  const { data: accessMockTestData } = useSWR<AccessMockTestResponse>(
    "/api/student/accessMockTest/show",
    fetcher
  );

  const { data: mockTestData } = useSWR<MockTestResponse>(
    "/api/teacher/mockTest/show",
    fetcher
  );

  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  // const [selectedMockTest, setSelectedMockTest] = useState<any>(null);

  const mergedDataCourse = accessCourseData?.data.map((course) => {
    const accessCourse = courseData?.data.find(
      (course) => course.course_id === course.course_id
    );
    return {
      ...course,
      ...accessCourse,
    };
  });

  const mergedDataMockTest = accessMockTestData?.data.map((mockTest) => {
    const accessMockTest = mockTestData?.data.find(
      (mockTest) => mockTest.mock_test_id === mockTest.mock_test_id
    );
    return {
      ...mockTest,
      ...accessMockTest,
    };
  });

  const handleStartTest = (test: any) => {
    setSelectedTest(test);
    console.log(selectedTest);
    setIsTestModalVisible(true);
  };

  const handleModalCloseTest = () => {
    setIsTestModalVisible(false);
    setSelectedTest(null);
  };

  const formatDateTimeToUTC = (dateTime: string) => {
    return dayjs.utc(dateTime).toISOString();
  };

  const mergedData = accessPlacemenetTestData?.data.map((access) => {
    const placementInfo = placemenetTestData?.data.find(
      (placement) => placement.placement_test_id === access.placement_test_id
    );

    return {
      ...access,
      ...placementInfo,
    };
  });

  const startQuiz = () => {
    if (selectedTest.mock_test_id) {
      router.push(
        `/student/dashboard/mock-test?testId=${selectedTest.mock_test_id}&accessId=${selectedTest.access_mock_test_id}&t=${selectedTest.timeLimit}`
      );
    } else if (selectedTest.placement_test_id) {
      router.push(
        `/student/dashboard/placement-test?testId=${selectedTest.placement_test_id}&accessId=${selectedTest.access_placement_test_id}&t=${selectedTest.timeLimit}`
      );
    } else {
      console.error("Jenis tes tidak diketahui:", selectedTest);
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  // Format events
  const events =
    showMeetingById?.data?.map((meeting: any) => {
      const formatDateTimeToUTC = (dateTime: string) => {
        return dayjs.utc(dateTime).toISOString();
      };

      const filteredData = dataTeacher?.data.find(
        (teacher) => teacher.user_id === meeting.teacher_id
      );

      return {
        title: `Meeting with ${filteredData?.username || "Teacher"}`,
        start: formatDateTimeToUTC(meeting.dateTime),
        extendedProps: {
          teacherName: filteredData?.username || "Unknown",
          time: dayjs.utc(meeting.dateTime).format("HH:mm"),
          color: "blue",
          meetLink: meeting.meetLink,
          method: meeting.method,
        },
      };
    }) || [];

  const count_program = countPogramData?.data?.count_program || 0;

  return {
    formatDateTimeToUTC,
    isModalVisible,
    selectedEvent,
    handleEventClick,
    handleModalClose,
    events,
    count_program,
    mergedData,
    startQuiz,
    mergedDataCourse,
    handleStartTest,
    isTestModalVisible,
    setIsTestModalVisible,
    selectedTest,
    mergedDataMockTest,
    handleModalCloseTest,
  };
};
