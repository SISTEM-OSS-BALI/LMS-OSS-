"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  BookOutlined,
  CalendarFilled,
  LogoutOutlined,
  PieChartOutlined,
  ScheduleFilled,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  ConfigProvider,
  Flex,
  Image,
  Layout,
  Menu,
  theme,
  Dropdown,
  Modal,
  Badge,
} from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { useUsername } from "@/app/lib/auth/useLogin";
import { crudService } from "@/app/lib/services/crudServices";
import { useRouter } from "next/navigation";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menuMap: { [key: string]: string } = {
  "/admin/dashboard/home": "/admin/dashboard/home",
  "/admin/dashboard/consultant": "/admin/dashboard/consultant",
  "/admin/dashboard/teacher": "/admin/dashboard/teacher",
  "/admin/dashboard/teacher/calendar": "/admin/dashboard/teacher/calendar",
  "/admin/dashboard/program": "/admin/dashboard/program",
  "/admin/dashboard/queue": "/admin/dashboard/queue",
  "/admin/dashboard/teacher/absent": "/admin/dashboard/teacher/absent",
  "/admin/dashboard/teacher/data-teacher":
    "/admin/dashboard/teacher/data-teacher",
  "/admin/dashboard/student/reschedule": "/admin/dashboard/student/reschedule",
  "/admin/dashboard/student/data-student":
    "/admin/dashboard/student/data-student",
};

const DashboardStudent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();
  const username = useUsername();
  const router = useRouter();
  const [newRescheduleCount, setNewRescheduleCount] = useState(0);
  const [newTeacherAbsance, setNewTeacherAbsance] = useState(0);

  const fetchDataWithLastChecked = useCallback(
    async (
      endpoint: string,
      lastCheckedKey: string,
      setStateCallback: React.Dispatch<React.SetStateAction<number>>
    ) => {
      const lastChecked = localStorage.getItem(lastCheckedKey) || "";

      try {
        const query = lastChecked ? `?lastChecked=${lastChecked}` : "";
        const response = await crudService.get(`${endpoint}${query}`);
        setStateCallback(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    []
  );
  const handleRescheduleClick = () => {
    localStorage.setItem("lastCheckedRescheduleTime", Date.now().toString());
    setNewRescheduleCount(0);
    router.push("/admin/dashboard/student/reschedule");
  };

  const handleAbsentClick = () => {
    localStorage.setItem("lastCheckedTeacherAbsence", Date.now().toString());
    setNewTeacherAbsance(0);
    router.push("/admin/dashboard/teacher/absent");
  };

  useEffect(() => {
    fetchDataWithLastChecked(
      "/api/admin/rescheduleMeeting/count",
      "lastCheckedRescheduleTime",
      setNewRescheduleCount
    );

    fetchDataWithLastChecked(
      "/api/admin/teacher/countAbsent",
      "lastCheckedTeacherAbsence",
      setNewTeacherAbsance
    );

    const intervalId = setInterval(() => {
      fetchDataWithLastChecked(
        "/api/admin/teacher/countAbsent",
        "lastCheckedRescheduleTime",
        setNewRescheduleCount
      );

      fetchDataWithLastChecked(
        "/api/admin/teacher/countAbsent",
        "lastCheckedTeacherAbsence",
        setNewTeacherAbsance
      );
    }, 20000);

    return () => clearInterval(intervalId);
  }, [
    newRescheduleCount,
    newTeacherAbsance,
    setNewRescheduleCount,
    setNewTeacherAbsance,
    fetchDataWithLastChecked,
  ]);

  const items: MenuItem[] = [
    getItem(
      <Link href="/admin/dashboard/home">Dashboard</Link>,
      "/admin/dashboard/home",
      <PieChartOutlined />
    ),
    getItem(
      <Link href="/admin/dashboard/consultant">Konsultan</Link>,
      "/admin/dashboard/consultant",
      <UserOutlined />
    ),
    getItem(<span>Guru</span>, "/admin/dashboard/teacher", <UserOutlined />, [
      getItem(
        <Link href="/admin/dashboard/teacher/data-teacher">Data Guru</Link>,
        "/admin/dashboard/teacher/data-teacher",
        <UserOutlined />
      ),
      getItem(
        <Link href="/admin/dashboard/teacher/calendar">Kalender</Link>,
        "/admin/dashboard/teacher/calendar",
        <CalendarFilled />
      ),
      getItem(
        newTeacherAbsance > 0 ? (
          <Badge count={newTeacherAbsance} offset={[10, 0]}>
            <Link
              href="/admin/dashboard/teacher/absent"
              onClick={handleAbsentClick}
            >
              Absen
            </Link>
          </Badge>
        ) : (
          <Link
            href="/admin/dashboard/teacher/absent"
            onClick={handleAbsentClick}
          >
            Absen
          </Link>
        ),
        "/admin/dashboard/teacher/absent",
        <ScheduleFilled />
      ),
    ]),
    getItem(<span>Siswa</span>, "/admin/dashboard/student", <UserOutlined />, [
      getItem(
        <Link href="/admin/dashboard/student/data-student">Data Siswa</Link>,
        "/admin/dashboard/student/data-student",
        <UserOutlined />
      ),
      getItem(
        newRescheduleCount > 0 ? (
          <Badge count={newRescheduleCount} offset={[10, 0]}>
            <Link
              href="/admin/dashboard/student/reschedule"
              onClick={handleRescheduleClick}
            >
              Reschedule
            </Link>
          </Badge>
        ) : (
          <Link
            href="/admin/dashboard/student/reschedule"
            onClick={handleRescheduleClick}
          >
            Reschedule
          </Link>
        ),
        "/admin/dashboard/student/reschedule",
        <ScheduleFilled />
      ),
    ]),
    getItem(
      <Link href="/admin/dashboard/program">Program</Link>,
      "/admin/dashboard/program",
      <BookOutlined />
    ),
    getItem(
      <Link href="/admin/dashboard/queue">Antrian</Link>,
      "/admin/dashboard/queue",
      <TableOutlined />
    ),
  ];

  const determineSelectedKeys = (pathname: string): string[] => {
    const exactMatch = Object.entries(menuMap).find(
      ([key]) => key === pathname
    );

    if (exactMatch) {
      return [exactMatch[1]];
    }

    const matchedEntry = Object.entries(menuMap).find(([key]) =>
      pathname.startsWith(key)
    );

    if (pathname.startsWith("/admin/dashboard/teacher")) {
      return ["/admin/dashboard/teacher"];
    }

    if (pathname.startsWith("/admin/dashboard/student")) {
      return ["/admin/dashboard/student"];
    }

    if (pathname.startsWith("/admin/dashboard/consultant")) {
      return ["/admin/dashboard/consultant"];
    }

    return matchedEntry ? [matchedEntry[1]] : [];
  };

  const selectedKeys = determineSelectedKeys(pathname);

  const menu = (
    <Menu
      items={[
        {
          key: "profil",
          label: "Profil",
          icon: <UserOutlined />,
          onClick: () => {},
        },
        {
          key: "logout",
          label: "Keluar",
          icon: <LogoutOutlined />,
          onClick: () => {
            console.log("logout");
          },
        },
      ]}
    />
  );

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
            colorBgContainer: primaryColor,
            colorText: "white",
          },
        },
        token: {
          colorPrimary: secondaryColor,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            position: "fixed",
            height: "100vh",
            overflow: "hidden",
            width: 200,
            left: 0,
            zIndex: 1000,
            boxShadow: "8px 0 10px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            className="logo"
            style={{
              color: "white",
              padding: "16px",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={60}
              preview={false}
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={["/student/dashboard/home"]}
            selectedKeys={selectedKeys}
            items={items}
          />
        </Sider>
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200,
            marginTop: 50,
            transition: "margin-left 0.2s",
          }}
        >
          <Flex
            align="center"
            justify="space-between"
            style={{
              paddingBlock: "1rem",
              paddingInline: "3rem",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 998,
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Flex
              style={{
                display: "flex",
                listStyleType: "none",
                padding: 0,
                margin: 0,
                gap: 20,
              }}
              // eslint-disable-next-line react/no-children-prop
              children={undefined}
            ></Flex>
            <Flex justify="center" align="center" gap={20}>
              <Dropdown overlay={menu}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                  }}
                >
                  <Flex
                    gap={20}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                  >
                    <Avatar icon={<UserOutlined />} style={{}} />
                    <div style={{ color: "black", textAlign: "right" }}>
                      <div>{username}</div>
                      <div style={{ fontSize: "smaller", marginTop: 5 }}>
                        Admin
                      </div>
                    </div>
                  </Flex>
                </a>
              </Dropdown>
            </Flex>
          </Flex>
          <Content style={{ margin: "40px 16px" }}>
            <div
              style={{
                padding: 24,
                // background: colorBgContainer,
                // borderRadius: borderRadiusLG,
                minHeight: "100vh",
              }}
            >
              {children}
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
              boxShadow: "0px -5px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            LMS OSS ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default DashboardStudent;
