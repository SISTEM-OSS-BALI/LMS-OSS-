"use client";

import React, { useState } from "react";
import {
  CalendarOutlined,
  DesktopOutlined,
  LogoutOutlined,
  PieChartOutlined,
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
} from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { useCount, useUsername } from "@/app/lib/auth/useLogin";

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
  "/student/dashboard": "/student/dashboard",
  "/student/dashboard/courses": "/student/dashboard/courses",
  "/student/dashboard/meeting": "/student/dashboard/meeting",
  "/student/dashboard/try-out": "/student/dashboard/try-out",
  "/student/dashboard/work-sheet": "/student/dashboard/work-sheet",
  "/student/dashboard/certificate": "/student/dashboard/certificate",
};

const items: MenuItem[] = [
  getItem(
    <Link href="/student/dashboard">Dashboard</Link>,
    "/student/dashboard",
    <PieChartOutlined />
  ),
  getItem(
    <Link href={"/student/dashboard/try-out"}>Try Out</Link>,
    "/student/dashboard/try-out",
    <CalendarOutlined />
  ),
  getItem(
    <Link href={"/student/dashboard/meeting"}>Jadwal Pertemuan</Link>,
    "/student/dashboard/meeting",
    <CalendarOutlined />
  ),
  getItem(
    <Link href={"/student/dashboard/work-sheet"}>Work Sheet</Link>,
    "/student/dashboard/work-sheet",
    <CalendarOutlined />
  ),
  getItem(
    <Link href="/student/dashboard/courses">Modul</Link>,
    "/student/dashboard/courses",
    <DesktopOutlined />
  ),
  getItem(
    <Link href={"/student/dashboard/certificate"}>Sertifikat</Link>,
    "/student/dashboard/certificate",
    <CalendarOutlined />
  ),
];

const DashboardStudent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();
  const username = useUsername();
  const count = useCount();
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

    if (pathname.startsWith("/student/dashboard/course-followed")) {
      return ["/student/dashboard/courses"];
    }

    return matchedEntry ? [matchedEntry[1]] : [];
  };

  const selectedKeys = determineSelectedKeys(pathname);

  const shouldHideSidebar = () => {
    const regex = /^\/student\/dashboard\/courses\/[^/]+\/materials\/[^/]+$/;
    return regex.test(pathname);
  };

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

  const isSidebarHidden = shouldHideSidebar();

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
        {!isSidebarHidden && (
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
              defaultSelectedKeys={["/student/dashboard"]}
              selectedKeys={selectedKeys}
              items={items}
            />
          </Sider>
        )}
        <Layout
          style={
            isSidebarHidden
              ? {}
              : {
                  marginLeft: collapsed ? 80 : 200,
                  marginTop: 50,
                  transition: "margin-left 0.2s",
                }
          }
        >
          {!isSidebarHidden && (
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
                          Student
                        </div>
                      </div>
                    </Flex>
                  </a>
                </Dropdown>
              </Flex>
            </Flex>
          )}
          <Content style={{ margin: "40px 16px" }}>
            <div
              style={{
                padding: 24,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                minHeight: "100vh",
              }}
            >
              {children}
            </div>
          </Content>
          {!isSidebarHidden && (
            <Footer
              style={{
                textAlign: "center",
                boxShadow: "0px -5px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              LMS OSS ©{new Date().getFullYear()}
            </Footer>
          )}

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
              <p style={{ fontSize: "24px", color: "#1890ff" }}>{count || 0} Pertemuan</p>
            </div>
          </Modal>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default DashboardStudent;
