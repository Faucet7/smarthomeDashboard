import { get, post, put } from "@/utils/request";

// 获取设备列表
export function getDeviceList(params) {
  const defaultParams = {
    pageIndex: 0,
    pageSize: 12,
    sorts: [{ name: "createTime", order: "desc" }],
    terms: [],
  };
  return post("/device/instance/_query", params || defaultParams);
}

// 部署设备（启用）
export function deployDevice(productId) {
  // return request({
  //   url: `/device/product/${productId}/deploy`,
  //   method: "post",
  // });
  return post(`/device/instance/${productId}/deploy`);
}

// 取消部署设备（禁用）
export function undeployDevice(productId) {
  // return request({
  //   url: `/device/product/${productId}/undeploy`,
  //   method: "post",
  // });
  return post(`/device/instance/${productId}/undeploy`);
}

// 获取设备统计信息
export function getDeviceStats() {
  return get("/device/stats");
}

//获取设备属性
export function getDeviceProperties(deviceId, property) {
  return get(`/device/instance/${deviceId}/property/${property}/_query`);
}

// 获取设备详情
export function getDeviceDetail(deviceId) {
  return get(`/device/instance/${deviceId}/detail`);
}

// 获取设备日志
export function getDeviceLogs(deviceId, filter = {}) {
  const defaultFilter = {
    pageIndex: 0,
    pageSize: 10,
    sorts: [{ name: "createTime", order: "desc" }],
    terms: [],
  };
  return post(`/device/instance/${deviceId}/logs`, {
    ...defaultFilter,
    ...filter,
  });
}

// 切换设备状态（开关）
export function toggleDevice(deviceId) {
  return post("/device/toggle", { deviceId });
}

// 更新设备属性（如亮度、温度等）
export function updateDevicePropertyApi(deviceId, data) {
  return put(`/device/instance/${deviceId}/property`, data);
}

// 获取设备类型列表
export function getDeviceTypes() {
  return get("/device/types");
}
