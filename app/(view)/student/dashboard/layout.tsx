"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Flex,
  GetProps,
  Image,
  Layout,
  Menu,
  MenuProps,
  Modal,
  theme,
} from "antd";
import Icon, {
  MenuOutlined,
  CalendarOutlined,
  DesktopOutlined,
  LogoutOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/authServices";
import { signOut } from "next-auth/react";
import { primaryColor, secondaryColor } from "@/app/lib/utils/colors";
import { CertificateSvg } from "@/app/components/Icon";

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
  // getItem(
  //   <Link href={"/student/dashboard/try-out"}>Try Out</Link>,
  //   "/student/dashboard/try-out",
  //   <CalendarOutlined />
  // ),
  getItem(
    <Link href={"/student/dashboard/meeting"}>Jadwal Pertemuan</Link>,
    "/student/dashboard/meeting",
    <CalendarOutlined />
  ),
  // getItem(
  //   <Link href={"/student/dashboard/work-sheet"}>Work Sheet</Link>,
  //   "/student/dashboard/work-sheet",
  //   <CalendarOutlined />
  // ),
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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const pathname = usePathname();
  const { username, imageUrl } = useAuth();
  const router = useRouter();

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

  const menu = (
    <Menu
      items={[
        {
          key: "profil",
          label: "Profil",
          icon: <UserOutlined />,
          onClick: () => router.push("/student/dashboard/profile"),
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: showConfirmLogout,
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
      <Layout style={{ height: "100vh" }}>
        {/* Sidebar untuk Desktop */}
        {!isSidebarHidden && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            breakpoint="lg"
            collapsedWidth="0"
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

        {/* Drawer untuk Mobile */}
        <Drawer
          placement="left"
          style={{ backgroundColor: primaryColor }}
          closable
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["/student/dashboard/home"]}
            selectedKeys={selectedKeys}
            items={items}
          />
        </Drawer>

        {/* Layout Konten */}
        <Layout
          style={
            isSidebarHidden
              ? {}
              : {
                  marginLeft: collapsed ? 0 : 200,
                  marginTop: 50,
                  transition: "margin-left 0.2s",
                }
          }
        >
          {/* Header */}
          {!isSidebarHidden && (
            <Flex
              align="center"
              justify="space-between"
              style={{
                paddingBlock: "1rem",
                paddingInline: "2rem",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 998,
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Tombol Menu untuk Mobile */}
              <Button
                type="text"
                icon={<MenuOutlined />}
                size="large"
                onClick={() => setDrawerVisible(true)}
                style={{ display: "block" }}
              />

              {/* Profil & Logout */}
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
                    <Avatar
                      src={imageUrl}
                      size={45}
                      icon={!imageUrl && <UserOutlined />}
                      style={{
                        backgroundColor: "#1890ff",
                        position: "relative",
                      }}
                    />
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
          )}

          {/* Konten Utama */}
          <Content
            style={{
              margin: "20px 12px",
              padding: window.innerWidth <= 768 ? "20px 10px" : "20px", // Padding lebih kecil di mobile
              height: "auto",
              overflow: "auto",
            }}
          >
            <div
            >
              {children}
            </div>
          </Content>

          {/* Footer */}
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
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default DashboardStudent;
