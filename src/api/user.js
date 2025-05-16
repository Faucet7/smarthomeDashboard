import { post, put, get } from "@/utils/request";

// 用户登录
export function login(data) {
  return post("/authorize/login", data);
}

// 用户注册 - 尝试不同的方法和路径
export function register(data) {
  // 尝试POST方法（默认）
  return post("/user/register", data);
}

// 获取用户信息
export function getUserInfo() {
  return get("/user/info");
}

// 获取用户详情
export function getUserDetail() {
  return get("/user/detail");
}

// 编辑用户信息
export function updateUserInfo(data) {
  return post("/user/update", data);
}

// 修改密码
export function changePassword(data) {
  return post("/user/change-password", data);
}
