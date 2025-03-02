"use client";

import React, { useState } from "react";
import {
  DesktopOutlined,
  ExceptionOutlined,
  FileOutlined,
  LogoutOutlined,
  PieChartOutlined,
  TableOutlined,
  UsergroupAddOutlined,
  UserOutlined,
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
  theme,
} from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { useDashboardViewModel } from "./home/useDashboardViewModel";
import { useAuth } from "@/app/lib/auth/authServices";

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
  "/teacher/dashboard/home": "/teacher/dashboard/home",
  "/teacher/dashboard/courses": "/teacher/dashboard/courses",
  "/teacher/dashboard/queue": "/teacher/dashboard/queue",
  "/teacher/dashboard/student": "/teacher/dashboard/student",
  "/teacher/dashboard/placement-test": "/teacher/dashboard/placement-test",
  "/teacher/dashboard/mock-test": "/teacher/dashboard/mock-test",
};

const items: MenuItem[] = [
  getItem(
    <Link href="/teacher/dashboard/home">Dashboard</Link>,
    "/teacher/dashboard/home",
    <PieChartOutlined />
  ),
  getItem(
    <Link href="/teacher/dashboard/courses">Modul</Link>,
    "/teacher/dashboard/courses",
    <DesktopOutlined />
  ),
  getItem(
    <Link href="/teacher/dashboard/queue">Antrian</Link>,
    "/teacher/dashboard/queue",
    <TableOutlined />
  ),
  getItem(
    <Link href="/teacher/dashboard/student">Siswa</Link>,
    "/teacher/dashboard/student",
    <UsergroupAddOutlined />
  ),
  getItem(
    <Link href="/teacher/dashboard/placement-test">Placement Test</Link>,
    "/teacher/dashboard/placement-test",
    <ExceptionOutlined />
  ),
  getItem(
    <Link href="/teacher/dashboard/mock-test">Try Out</Link>,
    "/teacher/dashboard/mock-test",
    <FileOutlined />
  ),
];

const DashboardTeacher: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();
 const { username } = useAuth();
  const { count_program } = useDashboardViewModel();
  const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);

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
          onClick: () => setIsModalProfileVisible(true),
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
            defaultSelectedKeys={["/teacher/dashboard/home"]}
            items={items}
            selectedKeys={selectedKeys}
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
                        Teacher
                      </div>
                    </div>
                  </Flex>
                </a>
              </Dropdown>
            </Flex>
          </Flex>
          <Content style={{ margin: "40px 16px", padding: "10px 20px" }}>
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
        <Modal
          open={isModalProfileVisible}
          onCancel={() => setIsModalProfileVisible(false)}
          title="Profil"
          footer={null}
          style={{ top: 20 }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>
              Total Pertemuan
            </p>
            <p style={{ fontSize: "24px", color: "#1890ff" }}>
              {count_program || 0} Pertemuan
            </p>
          </div>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

export default DashboardTeacher;
