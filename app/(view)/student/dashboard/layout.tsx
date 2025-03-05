"use client";

import React, { useState } from "react";
import Icon, {
  CalendarOutlined,
  DesktopOutlined,
  LogoutOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { GetProps, MenuProps } from "antd";
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
import { useMeetings } from "./home/useMeetingViewModel";
import { CertificateSvg } from "@/app/components/Icon";
import { useAuth } from "@/app/lib/auth/authServices";
import { signOut } from "next-auth/react";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];
type CustomIconComponentProps = GetProps<typeof Icon>;

const CertificateIcon = (props: CustomIconComponentProps) => (
  <Icon component={CertificateSvg} {...props} />
);

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
  "/student/dashboard/home": "/student/dashboard/home",
  "/student/dashboard/course-followed": "/student/dashboard/course-followed",
  "/student/dashboard/meeting": "/student/dashboard/meeting",
  "/student/dashboard/try-out": "/student/dashboard/try-out",
  "/student/dashboard/work-sheet": "/student/dashboard/work-sheet",
  "/student/dashboard/certificate": "/student/dashboard/certificate",
};

const items: MenuItem[] = [
  getItem(
    <Link href="/student/dashboard/home">Dashboard</Link>,
    "/student/dashboard/home",
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
    <Link href="/student/dashboard/course-followed">Modul</Link>,
    "/student/dashboard/course-followed",
    <DesktopOutlined />
  ),
  getItem(
    <Link href={"/student/dashboard/certificate"}>Sertifikat</Link>,
    "/student/dashboard/certificate",
    <CertificateIcon style={{ fontSize: "5px" }} />
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
  const { username } = useAuth();
  const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);
  const { count_program } = useMeetings();

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
    const regex2 = /^\/student\/dashboard\/placement-test$/;
    const regex3 = /^\/student\/dashboard\/placement-test\/result$/;
    const regex4 = /^\/student\/dashboard\/mock-test$/;
    const regex5 = /^\/student\/dashboard\/placement-test\/history\/[^/]+$/;
    return (
      regex.test(pathname) ||
      regex2.test(pathname) ||
      regex3.test(pathname) ||
      regex4.test(pathname) ||
      regex5.test(pathname)
    );
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
          onClick: async () => {
            await signOut({ callbackUrl: "/" }); // 🔹 Logout dan redirect ke halaman utama
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
          <Content
            style={{
              margin: "40px 16px",
              padding: "10px 20px",
              height: "auto",
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: 24,
                // background: colorBgContainer,
                // borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>
          {!isSidebarHidden && (
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
              <p style={{ fontSize: "24px", color: "#1890ff" }}>
                {count_program}
              </p>
            </div>
          </Modal>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default DashboardStudent;
