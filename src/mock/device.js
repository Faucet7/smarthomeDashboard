import {
  validateToken,
  getUserByToken,
  getHomeByUserId,
  getHomeDevices,
  getDeviceById,
  getDeviceLogs,
  getDeviceStats,
  toggleDevice,
  updateDeviceProperty,
  DEVICE_TYPES,
  LOG_TYPES,
} from "./data";

// 设置设备相关的mock API
export function setupDeviceMocks(mock) {
  // 获取家庭设备列表
  mock.onGet("/device/list").reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 获取用户家庭的设备列表
      const devices = getHomeDevices(user.homeId).map((device) => ({
        id: device.id,
        name: device.name,
        type: device.type,
        online: device.online,
        status: device.status,
        lastActive: device.lastActive,
      }));

      return [
        200,
        {
          status: 200,
          message: "获取设备列表成功",
          result: {
            devices,
            total: devices.length,
          },
        },
      ];
    } catch (error) {
      console.error("Get device list mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取设备详情
  mock.onGet(new RegExp("/device/detail/.*")).reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 从URL中提取设备ID
      const deviceId = config.url.split("/").pop();

      // 获取设备详情
      const device = getDeviceById(deviceId);

      if (!device) {
        return [404, { status: 404, message: "设备不存在", code: "not_found" }];
      }

      // 检查设备是否属于用户的家庭
      if (device.homeId !== user.homeId) {
        return [
          403,
          { status: 403, message: "无权访问此设备", code: "forbidden" },
        ];
      }

      return [
        200,
        {
          status: 200,
          message: "获取设备详情成功",
          result: {
            device,
          },
        },
      ];
    } catch (error) {
      console.error("Get device detail mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取设备日志
  mock.onGet(new RegExp("/device/logs/.*")).reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 检查用户权限 - 只有管理员可以查看日志
      if (user.type.id !== 1) {
        // 不是管理员
        return [
          403,
          { status: 403, message: "没有权限查看设备日志", code: "forbidden" },
        ];
      }

      // 从URL中提取设备ID
      const deviceId = config.url.split("/").pop();

      // 获取设备详情
      const device = getDeviceById(deviceId);

      if (!device) {
        return [404, { status: 404, message: "设备不存在", code: "not_found" }];
      }

      // 检查设备是否属于用户的家庭
      if (device.homeId !== user.homeId) {
        return [
          403,
          { status: 403, message: "无权访问此设备", code: "forbidden" },
        ];
      }

      // 解析查询参数
      const params = new URLSearchParams(config.params);
      const filters = {
        type: params.get("type") || "",
        startDate: params.get("startDate") || "",
        endDate: params.get("endDate") || "",
      };

      // 获取设备日志
      const logs = getDeviceLogs(deviceId, filters);

      return [
        200,
        {
          status: 200,
          message: "获取设备日志成功",
          result: {
            logs,
            total: logs.length,
          },
        },
      ];
    } catch (error) {
      console.error("Get device logs mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取家庭设备统计
  mock.onGet("/device/stats").reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 获取设备统计信息
      const stats = getDeviceStats(user.homeId);

      return [
        200,
        {
          status: 200,
          message: "获取设备统计成功",
          result: {
            stats,
          },
        },
      ];
    } catch (error) {
      console.error("Get device stats mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 切换设备状态
  mock.onPost("/device/toggle").reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 解析请求数据
      const { deviceId } = JSON.parse(config.data);

      if (!deviceId) {
        return [
          400,
          { status: 400, message: "设备ID不能为空", code: "invalid_params" },
        ];
      }

      // 获取设备详情
      const device = getDeviceById(deviceId);

      if (!device) {
        return [404, { status: 404, message: "设备不存在", code: "not_found" }];
      }

      // 检查设备是否属于用户的家庭
      if (device.homeId !== user.homeId) {
        return [
          403,
          { status: 403, message: "无权操作此设备", code: "forbidden" },
        ];
      }

      // 检查设备是否在线
      if (!device.online) {
        return [
          400,
          {
            status: 400,
            message: "设备离线，无法操作",
            code: "device_offline",
          },
        ];
      }

      // 切换设备状态
      const updatedDevice = toggleDevice(deviceId);

      return [
        200,
        {
          status: 200,
          message: `设备已${updatedDevice.status ? "开启" : "关闭"}`,
          result: {
            device: updatedDevice,
          },
        },
      ];
    } catch (error) {
      console.error("Toggle device mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 更新设备属性
  mock.onPost("/device/update").reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 获取用户信息
      const user = getUserByToken(token);

      if (!user) {
        return [404, { status: 404, message: "用户不存在", code: "not_found" }];
      }

      // 检查用户权限 - 只有管理员可以修改设备属性
      if (user.type.id !== 1) {
        // 不是管理员
        return [
          403,
          { status: 403, message: "没有权限修改设备属性", code: "forbidden" },
        ];
      }

      // 解析请求数据
      const { deviceId, property, value } = JSON.parse(config.data);

      if (!deviceId || !property) {
        return [
          400,
          { status: 400, message: "参数不完整", code: "invalid_params" },
        ];
      }

      // 获取设备详情
      const device = getDeviceById(deviceId);

      if (!device) {
        return [404, { status: 404, message: "设备不存在", code: "not_found" }];
      }

      // 检查设备是否属于用户的家庭
      if (device.homeId !== user.homeId) {
        return [
          403,
          { status: 403, message: "无权操作此设备", code: "forbidden" },
        ];
      }

      // 检查设备是否在线
      if (!device.online) {
        return [
          400,
          {
            status: 400,
            message: "设备离线，无法操作",
            code: "device_offline",
          },
        ];
      }

      // 更新设备属性
      const updatedDevice = updateDeviceProperty(deviceId, property, value);

      if (!updatedDevice) {
        return [
          400,
          { status: 400, message: "属性更新失败", code: "update_failed" },
        ];
      }

      return [
        200,
        {
          status: 200,
          message: "设备属性更新成功",
          result: {
            device: updatedDevice,
          },
        },
      ];
    } catch (error) {
      console.error("Update device property mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取设备类型列表
  mock.onGet("/device/types").reply((config) => {
    try {
      // 从请求头获取token
      const token = config.headers["x-access-token"];

      if (!token) {
        return [
          401,
          { status: 401, message: "用户未登录", code: "unauthorized" },
        ];
      }

      // 验证token
      const validation = validateToken(token);

      if (!validation.valid) {
        return [
          401,
          { status: 401, message: validation.reason, code: "unauthorized" },
        ];
      }

      // 转换设备类型为数组形式
      const types = Object.values(DEVICE_TYPES).map((type) => ({
        id: type.id,
        name: type.name,
      }));

      return [
        200,
        {
          status: 200,
          message: "获取设备类型列表成功",
          result: {
            types,
          },
        },
      ];
    } catch (error) {
      console.error("Get device types mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });
}
