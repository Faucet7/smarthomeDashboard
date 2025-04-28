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

// 备选注册路径1
export function registerAlt1(data) {
  // 尝试PUT方法
  return put("/user/register", data);
}

// 备选注册路径2
export function registerAlt2(data) {
  // 尝试不同的URL格式
  return post("/api/user/register", data);
}

// 备选注册路径3
export function registerAlt3(data) {
  // 尝试去掉前导斜杠
  return post("user/register", data);
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
