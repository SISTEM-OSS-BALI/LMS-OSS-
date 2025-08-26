"use client";

import React, { useState, useEffect } from "react";
import {
  DesktopOutlined,
  ExceptionOutlined,
  FileOutlined,
  LogoutOutlined,
  PieChartOutlined,
  TableOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  MenuOutlined,
  CalendarOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  ConfigProvider,
  Dropdown,
  Flex,
  Image,
  Layout,
  Menu,
  Modal,
  Button,
  Grid,
  Calendar,
} from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { useAuth } from "@/app/lib/auth/authServices";
import { signOut } from "next-auth/react";

const { Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];

const menuMap: { [key: string]: string } = {
  "/teacher/dashboard/home": "/teacher/dashboard/home",
  "/teacher/dashboard/courses": "/teacher/dashboard/courses",
  "/teacher/dashboard/queue": "/teacher/dashboard/queue",
  "/teacher/dashboard/student": "/teacher/dashboard/student",
  "/teacher/dashboard/placement-test": "/teacher/dashboard/placement-test",
  "/teacher/dashboard/mock-test": "/teacher/dashboard/mock-test",
  "/teacher/dashboard/schedule": "/teacher/dashboard/schedule",
  "/teacher/dashboard/activity": "/teacher/dashboard/activity",
};

const items: MenuItem[] = [
  {
    key: "/teacher/dashboard/home",
    icon: <PieChartOutlined />,
    label: <Link href="/teacher/dashboard/home">Dashboard</Link>,
  },
  {
    key: "/teacher/dashboard/courses",
    icon: <DesktopOutlined />,
    label: <Link href="/teacher/dashboard/courses">Module</Link>,
  },
  {
    key: "/teacher/dashboard/queue",
    icon: <TableOutlined />,
    label: <Link href="/teacher/dashboard/queue">Timesheet</Link>,
  },
  {
    key: "/teacher/dashboard/student",
    icon: <UsergroupAddOutlined />,
    label: <Link href="/teacher/dashboard/student">Student</Link>,
  },
  {
    key: "/teacher/dashboard/placement-test",
    icon: <ExceptionOutlined />,
    label: <Link href="/teacher/dashboard/placement-test">Placement Test</Link>,
  },
  {
    key: "/teacher/dashboard/mock-test",
    icon: <FileOutlined />,
    label: <Link href="/teacher/dashboard/mock-test">Mock Test</Link>,
  },
  {
    key: "/teacher/dashboard/schedule",
    icon: <CalendarOutlined />,
    label: <Link href="/teacher/dashboard/schedule">Schedule</Link>,
  },
  {
    key: "/teacher/dashboard/activity",
    icon: <ThunderboltFilled />,
    label: <Link href="/teacher/dashboard/activity">Activity Tracking</Link>,
  },
];

const DashboardTeacher: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { username, imageUrl } = useAuth();
  const router = useRouter();
  const screens = useBreakpoint();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile); // Sidebar otomatis collapse di mobile
    };

    handleResize(); // Panggil saat pertama kali dimuat
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    if (pathname.startsWith("/teacher/dashboard/courses")) {
      return ["/teacher/dashboard/courses"];
    }

    if (pathname.startsWith("/teacher/dashboard/student/detail")) {
      return ["/teacher/dashboard/student"];
    }

    if (pathname.startsWith("/teacher/dashboard/placement-test/")) {
      return ["/teacher/dashboard/placement-test"];
    }

    if (pathname.startsWith("/teacher/dashboard/history-test")) {
      return ["/teacher/dashboard/student"];
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
          onClick: () => router.push("/teacher/dashboard/profile"),
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: () => showConfirmLogout(),
        },
      ]}
    />
  );

  const showConfirmLogout = () => {
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
          Menu: { colorBgContainer: primaryColor, colorText: "white" },
        },
        token: { colorPrimary: secondaryColor },
      }}
    >
      <Layout style={{ height: "100vh" }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            position: "fixed",
            height: "100vh",
            overflowY: "auto",
            left: 0,
            zIndex: 1000,
            boxShadow: isMobile ? "none" : "8px 0 10px -5px rgba(0, 0, 0, 0.2)",
            display: isMobile && collapsed ? "none" : "block", // Sembunyikan sidebar jika di mobile dan collapsed
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
          <Menu mode="inline" selectedKeys={selectedKeys} items={items} />
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? (isMobile ? 0 : 80) : 200,
            transition: "margin-left 0.2s",
          }}
        >
          {/* Header */}
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
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)} // Klik hamburger untuk buka/tutup sidebar
              />
            )}

            {/* Avatar dan Username di sebelah kanan */}
            <Flex
              style={{ marginLeft: "auto" }} // ✅ Mendorong Avatar ke kanan
              align="center"
              gap={20}
            >
              <Dropdown overlay={menu}>
                <a onClick={(e) => e.preventDefault()}>
                  <Flex align="center" gap={20} style={{ cursor: "pointer" }}>
                    <Avatar
                      src={imageUrl}
                      size={45}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                    <div style={{ color: "black", textAlign: "right" }}>
                      <div>{username}</div>
                      <div style={{ fontSize: "smaller", marginTop: 5 }}>
                        Teacher
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
            <div style={{ marginTop: 100 }}>{children}</div>
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

export default DashboardTeacher;
