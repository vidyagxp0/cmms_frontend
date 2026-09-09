import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ConfigProvider,
  Card,
  Form,
  Input,
  Checkbox,
  Button,
  Typography,
} from "antd";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiTool,
  FiZap,
} from "react-icons/fi";

import { login } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";

import cmmsPharmaLeft from "../../../assets/images/login/cmmsPharmaLeft.png";

const { Text } = Typography;

const FONT_LINKS = [
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
];

function useGoogleFonts() {
  useEffect(() => {
    FONT_LINKS.forEach((href) => {
      if (![...document.styleSheets].some((sheet) => sheet.href === href)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);
}

// Ant Design theme tokens matched to the existing Maintenix navy/cyan identity
const themeConfig = {
  token: {
    colorPrimary: "#0891b2",
    colorPrimaryHover: "#0e7490",
    borderRadius: 14,
    fontFamily: "'Inter', system-ui, sans-serif",
    colorTextPlaceholder: "#9aa5b1",
  },
  components: {
    Input: {
      controlHeightLG: 56,
      colorBorder: "#e5e9ef",
      activeBorderColor: "#22d3ee",
      hoverBorderColor: "#cbd5e1",
      activeShadow: "0 0 0 4px rgba(34,211,238,0.10)",
    },
    Button: {
      controlHeightLG: 56,
    },
    Checkbox: {
      colorPrimary: "#06b6d4",
    },
  },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const PharmaCMMS = () => {
  return (
    <div className="relative hidden h-screen w-[46%] max-w-[860px] shrink-0 p-1 lg:block ml-16 mt-4">
      <img
        src={cmmsPharmaLeft}
        alt="Computerized Maintenance Management System"
        className="py-30"
        draggable="false"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 " />
    </div>
  );
};

const Login = () => {
  const [loginErrors, setLoginErrors] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const setUser = useAuthStore((state) => state.setUser);

  useGoogleFonts();

  const navigate = useNavigate();

  // Same auth logic as before — only the source of the email/password values
  // changed, from FormData to the antd Form's onFinish values.
  const handleLogin = async (values) => {
    const payload = {
      email: values.email,
      password: values.password,
    };

    setLoginErrors(false);
    setLoading(true);

    try {
      const response = await login(payload);

      console.log("STATUS:", response.status);
      console.log("DATA:", response.data);

      if (response.status !== 200 || !response.data?.data?.token) {
        setLoginErrors(true);
        setLoading(false);
        return;
      }

      const { user: apiUser, token } = response.data.data;

      const user = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        roleType: apiUser.role_type,
        roles: apiUser.roles || [],
        permissions: apiUser.permissions || [],
      };

      const isAdmin = apiUser.role_type === "Admin";

      if (isAdmin) {
        sessionStorage.setItem("admin_token", token);
        sessionStorage.removeItem("user_token");
      } else {
        sessionStorage.setItem("user_token", token);
        sessionStorage.removeItem("admin_token");
      }

      sessionStorage.setItem("auth_type", apiUser.role_type);

      setUser(user);

      toast.success("Login successful");

      navigate(isAdmin ? "/admin/dashboard" : "/user/equipment-dashboard", {
        replace: true,
      });
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      setLoginErrors(true);

      toast.error(
        error.response?.data?.message || "User or Password Incorrect",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        className=" flex items-center justify-center grid-cols-2 w-auto h-screen overflow-hidden bg-gradient-to-br from-blue-200 to-[#f1f5f9]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="flex h-screen w-full">
          <PharmaCMMS />

          <div className="mt-0 flex h-screen w-full items-center justify-center overflow-hidden  lg:mt-0">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="relative z-10 w-full max-w-[440px]"
            >
              {/* Mobile-only brand row */}
              <motion.div
                variants={itemVariants}
                className="mb-7 flex items-center gap-3 lg:hidden"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082943] shadow-lg">
                  <FiTool className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h1
                    className="text-xl font-extrabold tracking-tight text-[#082943]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Maintenix
                  </h1>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Maintenance Intelligence
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card
                  bordered={false}
                  className="rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(8,41,67,0.10)] !bg-white backdrop-blur-[30px] lg:rounded-[2rem] "
                  styles={{ body: { padding: "2.85rem 1.95rem" } }}
                >
                  <div className="mb-8 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center gap-10 py-1">
                      <img
                        src="/vidyagxp_logo.png"
                        alt="VidyaGxP Logo"
                        className="mb-5 block h-auto w-[160px] object-contain"
                        draggable="false"
                      />
                      <img
                        src="/shilpaimage.png"
                        alt="VidyaGxP Logo"
                        className="mb-5 block h-auto w-[160px] object-contain"
                        draggable="false"
                      />
                    </div>

                    <h2
                      className="text-[16px] font-extrabold leading-tight tracking-[-1px] text-[#091f33] sm:text-[26px] flex flex-col items-center justify-center gap-2"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Welcome To VidyaGxP
                      <span>CMMS</span>
                    </h2>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    requiredMark={false}
                    className="space-y-1"
                  >
                    <Form.Item
                      label={
                        <span className="text-[13px] font-semibold text-gray-600">
                          Email address
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Enter your email" },
                        {
                          type: "email",
                          message: "Enter a valid email address",
                        },
                      ]}
                    >
                      <Input
                        size="medium"
                        name="email"
                        prefix={
                          <FiMail className="mr-1 h-4 w-4 text-gray-400" />
                        }
                        placeholder="Enter your email"
                        className="!rounded-md bg-[#f8fafc]"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold text-gray-600">
                            Password
                          </span>
                        </div>
                      }
                      name="password"
                      rules={[
                        { required: true, message: "Enter your password" },
                      ]}
                    >
                      <Input.Password
                        size="medium"
                        name="password"
                        prefix={
                          <FiLock className="mr-1 h-4 w-4 text-gray-400" />
                        }
                        placeholder="Enter your password"
                        className="!rounded-md bg-[#f8fafc]"
                        iconRender={(visible) =>
                          visible ? (
                            <FiEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FiEye className="h-4 w-4 text-gray-400" />
                          )
                        }
                      />
                    </Form.Item>

                    {loginErrors && (
                      <Text
                        type="danger"
                        className="block text-[12px] font-medium"
                      >
                        User or Password Incorrect
                      </Text>
                    )}

                    <div className="flex items-center justify-between pt-2"></div>

                    <Form.Item className="mb-0 pt-3">
                      <motion.div
                        whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                      >
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="medium"
                          loading={loading}
                          className="group !h-[38px] !rounded-md !border-none !bg-gradient-to-r !from-[#082943] !via-[#0b3858] !to-[#0b4969] !text-[16px] !font-bold !shadow-lg !shadow-[#082943]/20"
                        >
                          {!loading && (
                            <span className="flex items-center justify-center gap-2">
                              Log In
                              <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </Form.Item>
                  </Form>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
