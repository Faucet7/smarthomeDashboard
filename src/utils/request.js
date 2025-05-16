import axios from "axios";
import { getToken } from "@/utils/auth";
import router from "@/router";
import { ElMessage } from "element-plus";

// 创建axios实例
const service = axios.create({
  baseURL: "http://ws.scut.mcurobot.com:28848", // API的基础URL
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做一些处理
    // 使用auth.js中的getToken方法获取token
    const token = getToken();
    if (token) {
      // 在请求头中添加token
      config.headers["x-access-token"] = token;
      // 记录日志用于调试
      console.log("请求携带token:", token);
    }
    return config;
  },
  (error) => {
    // 请求错误处理
    console.log(error); // 用于调试
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 检查响应格式并输出调试信息
    console.log("API响应:", res);

    // 根据响应数据中的状态码进行判断
    if (res.status !== undefined && res.status !== 200) {
      // 处理错误情况
      console.error("请求返回错误:", res.msg || res.message || "未知错误");
      return Promise.reject(new Error(res.msg || res.message || "未知错误"));
    } else {
      // 返回响应数据
      // 有些API可能直接返回数据而不包含status字段
      return res;
    }
  },
  (error) => {
    // 添加详细的错误日志
    console.error("请求失败:", error);

    if (error.response) {
      // 服务器返回了错误状态码
      console.error("错误状态码:", error.response.status);
      console.error("错误数据:", error.response.data);

      // 对特定状态码进行处理
      if (error.response.status === 405) {
        console.error("方法不允许，请检查API接口是否正确");
      } else if (error.response.status === 401) {
        console.error("未授权，可能是token已过期");
        // 可以在这里处理token过期的情况
        // ElMessage.error("登录已过期，请重新登录");
        // router.push("/login");
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error("未收到响应:", error.request);
    } else {
      // 请求配置出错
      console.error("请求配置错误:", error.message);
    }

    return Promise.reject(error);
  }
);

// 封装GET请求
export function get(url, params) {
  return service({
    url,
    method: "get",
    params,
  });
}

// 封装POST请求
export function post(url, data) {
  return service({
    url,
    method: "post",
    data,
  });
}

// 封装PUT请求
export function put(url, data) {
  return service({
    url,
    method: "put",
    data,
  });
}

// 封装DELETE请求
export function del(url, params) {
  return service({
    url,
    method: "delete",
    params,
  });
}

export default service;
