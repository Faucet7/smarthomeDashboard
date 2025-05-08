import { get, post } from "@/utils/request";

// 获取家庭信息
export function getHomeInfo() {
  return get("/home/info");
}

// 获取家庭成员列表
export function getHomeMembers() {
  return get("/home/members");
}

// 更新家庭信息
export function updateHomeInfo(data) {
  return post("/home/update", data);
}
