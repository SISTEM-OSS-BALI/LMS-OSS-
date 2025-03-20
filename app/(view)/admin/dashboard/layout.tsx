"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  BookOutlined,
  CalendarFilled,
  CheckCircleFilled,
  FileOutlined,
  FileTextOutlined,
  LogoutOutlined,
  PieChartOutlined,
  ScheduleFilled,
  TableOutlined,
  UserOutlined,
  MenuOutlined, // <-- Import icon hamburger
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
  Button,
  Grid, // <-- Tambah Button (untuk hamburger)
} from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { crudService } from "@/app/lib/services/crudServices";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/authServices";
import { signOut } from "next-auth/react";

const { Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

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
  "/admin/dashboard/student/calendar/confirm-account":
    "/admin/dashboard/student/calendar/confirm-account",
  "/admin/dashboard/report/placement-test":
    "/admin/dashboard/report/placement-test",
  "/admin/dashboard/report/mock-test": "/admin/dashboard/report/mock-test",
};

const DashboardStudent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // STATE bawaan
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Tambahkan state isMobile untuk deteksi layar kecil
  const [isMobile, setIsMobile] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const pathname = usePathname();
  const { username } = useAuth();
  const router = useRouter();
  const [newRescheduleCount, setNewRescheduleCount] = useState(0);
  const [newTeacherAbsance, setNewTeacherAbsance] = useState(0);
  const screens = useBreakpoint();

  // ✅ Gunakan effect untuk mendeteksi lebar layar & set isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile); // Auto-collapse jika layar kecil
    };

    handleResize(); // Panggil saat pertama kali dimuat
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showConfirmLogout = async () => {
    Modal.confirm({
      title: "Logout",
      content: "Apakah anda yakin ingin logout?",
      okText: "Logout",
      okType: "danger",
      onOk: async () => {
        await signOut({ callbackUrl: "/" });
      },
    });
  };

  // MENU DROPDOWN LOGOUT (Tetap)
  const menu = (
    <Menu
      items={[
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: () => {
            showConfirmLogout();
          },
        },
      ]}
    />
  );

  // LOGIKA FETCH (Tetap)
  const fetchDataWithLastChecked = useCallback(
    async (
      endpoint: string,
      lastCheckedKey: string,
      setStateCallback: React.Dispatch<React.SetStateAction<number>>
    ) => {
      const lastChecked = sessionStorage.getItem(lastCheckedKey) || "";

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
    sessionStorage.setItem("lastCheckedRescheduleTime", Date.now().toString());
    setNewRescheduleCount(0);
    router.push("/admin/dashboard/student/reschedule");
  };

  const handleAbsentClick = () => {
    sessionStorage.setItem("lastCheckedTeacherAbsence", Date.now().toString());
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
    }, 50000);

    return () => clearInterval(intervalId);
  }, [
    newRescheduleCount,
    newTeacherAbsance,
    setNewRescheduleCount,
    setNewTeacherAbsance,
    fetchDataWithLastChecked,
  ]);

  // MENU SIDEBAR (Tetap)
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
        <Link href="/admin/dashboard/student/confirm-account">
          Konfirmasi Akun
        </Link>,
        "/admin/dashboard/student/calendar/confirm-account",
        <CheckCircleFilled />
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
    getItem(<span>Laporan</span>, "/admin/dashboard/report", <FileOutlined />, [
      getItem(
        <Link href="/admin/dashboard/report/placement-test">
          Placement Test
        </Link>,
        "/admin/dashboard/report/placement-test",
        <FileTextOutlined />
      ),
      getItem(
        <Link href="/admin/dashboard/report/mock-test">Mock Test</Link>,
        "/admin/dashboard/report/mock-test",
        <FileTextOutlined />
      ),
    ]),
  ];

  // LOGIKA UNTUK SELECTED KEYS (Tetap)
  const determineSelectedKeys = (path: string): string[] => {
    const exactMatch = Object.entries(menuMap).find(([key]) => key === path);

    if (exactMatch) {
      return [exactMatch[1]];
    }

    const matchedEntry = Object.entries(menuMap).find(([key]) =>
      path.startsWith(key)
    );

    if (path.startsWith("/admin/dashboard/teacher")) {
      return ["/admin/dashboard/teacher"];
    }
    if (path.startsWith("/admin/dashboard/student")) {
      return ["/admin/dashboard/student"];
    }
    if (path.startsWith("/admin/dashboard/consultant")) {
      return ["/admin/dashboard/consultant"];
    }

    return matchedEntry ? [matchedEntry[1]] : [];
  };
  const selectedKeys = determineSelectedKeys(pathname);

  // LAYOUT & RENDER
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
      <Layout style={{ height: "100vh" }}>
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
            // ✅ Agar sidebar tidak hilang total di mobile saat collapsed:
            display: isMobile && collapsed ? "none" : "block",
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
              src="/assets/images/logo.jpg"
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
            marginLeft: collapsed ? (isMobile ? 0 : 80) : 200,
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
            {/* ✅ Tambahkan hamburger button jika mobile */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
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
              <Dropdown
                overlay={
                  <Menu
                    items={[
                      {
                        key: "logout",
                        label: "Logout",
                        icon: <LogoutOutlined />,
                        onClick: () => showConfirmLogout(),
                      },
                    ]}
                  />
                }
              >
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
                    <Avatar src="/assets/images/admin_picture.jpg" style={{}} />
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

          <Content
            style={{
              margin: "20px 12px",
              padding: screens.xs ? "20px 10px" : "20px", // Padding lebih kecil di mobile
              height: "auto",
              overflow: "auto",
            }}
          >
            <div>{children}</div>
          </Content>

          <Footer
            style={{
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
