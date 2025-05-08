// mock数据存储
import { v4 as uuidv4 } from "uuid";

// 用户类型常量
export const USER_TYPES = {
  ADMIN: { id: 1, name: "管理员" },
  MEMBER: { id: 2, name: "成员" },
};

// 设备类型常量
export const DEVICE_TYPES = {
  LIGHT: { id: "light", name: "灯光" },
  TV: { id: "tv", name: "电视" },
  AC: { id: "ac", name: "空调" },
  FRIDGE: { id: "fridge", name: "冰箱" },
  CAMERA: { id: "camera", name: "摄像头" },
  OTHER: { id: "other", name: "其他" },
};

// 日志类型常量
export const LOG_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  STATUS: "status",
};

// 家庭数据
export const homes = [
  {
    id: "home001",
    name: "智能家庭A",
    createdAt: "2023-01-10T08:00:00Z",
    updatedAt: "2023-06-15T14:30:00Z",
  },
  {
    id: "home002",
    name: "幸福家庭B",
    createdAt: "2023-02-20T10:15:00Z",
    updatedAt: "2023-07-22T16:45:00Z",
  },
  {
    id: "home003",
    name: "科技家庭C",
    createdAt: "2023-03-05T09:30:00Z",
    updatedAt: "2023-08-10T11:20:00Z",
  },
];

// 用户数据
export const users = [
  // 家庭A的用户
  {
    id: "user001",
    username: "admin1",
    password: "123456", // 实际应用中应该存储加密后的密码
    name: "张三",
    homeId: "home001",
    type: USER_TYPES.ADMIN,
    lastLoginTime: "2023-09-01T08:15:00Z",
    createdAt: "2023-01-10T08:00:00Z",
  },
  {
    id: "user002",
    username: "member1",
    password: "123456",
    name: "李四",
    homeId: "home001",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-02T10:30:00Z",
    createdAt: "2023-01-15T14:20:00Z",
  },

  // 家庭B的用户
  {
    id: "user003",
    username: "admin2",
    password: "123456",
    name: "王五",
    homeId: "home002",
    type: USER_TYPES.ADMIN,
    lastLoginTime: "2023-09-01T09:00:00Z",
    createdAt: "2023-02-20T10:15:00Z",
  },
  {
    id: "user004",
    username: "member2",
    password: "123456",
    name: "赵六",
    homeId: "home002",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-02T11:45:00Z",
    createdAt: "2023-02-25T16:30:00Z",
  },
  {
    id: "user005",
    username: "guest1",
    password: "123456",
    name: "钱七",
    homeId: "home002",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-03T14:10:00Z",
    createdAt: "2023-03-01T09:40:00Z",
  },

  // 家庭C的用户
  {
    id: "user006",
    username: "admin3",
    password: "123456",
    name: "孙八",
    homeId: "home003",
    type: USER_TYPES.ADMIN,
    lastLoginTime: "2023-09-01T10:20:00Z",
    createdAt: "2023-03-05T09:30:00Z",
  },
  {
    id: "user007",
    username: "member3",
    password: "123456",
    name: "周九",
    homeId: "home003",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-02T13:50:00Z",
    createdAt: "2023-03-10T15:00:00Z",
  },
  {
    id: "user008",
    username: "member4",
    password: "123456",
    name: "吴十",
    homeId: "home003",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-03T08:30:00Z",
    createdAt: "2023-03-15T11:20:00Z",
  },
  {
    id: "user009",
    username: "guest2",
    password: "123456",
    name: "郑十一",
    homeId: "home003",
    type: USER_TYPES.MEMBER,
    lastLoginTime: "2023-09-04T16:40:00Z",
    createdAt: "2023-03-20T10:10:00Z",
  },
];

// 设备数据
export const devices = [
  // 家庭A的设备
  {
    id: "device001",
    name: "客厅灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home001",
    online: true,
    status: true,
    createdAt: "2023-01-15T10:00:00Z",
    lastActive: "2023-09-15T19:30:00Z",
    ip: "192.168.1.101",
    mac: "AA:BB:CC:DD:EE:01",
    firmware: "v1.2.3",
    properties: {
      brightness: 80,
      color: "#FFFFFF",
      colorTemperature: 4500,
    },
  },
  {
    id: "device002",
    name: "卧室灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home001",
    online: true,
    status: false,
    createdAt: "2023-01-15T10:05:00Z",
    lastActive: "2023-09-15T22:15:00Z",
    ip: "192.168.1.102",
    mac: "AA:BB:CC:DD:EE:02",
    firmware: "v1.2.3",
    properties: {
      brightness: 60,
      color: "#FFF4E0",
      colorTemperature: 3000,
    },
  },
  {
    id: "device003",
    name: "电视",
    type: DEVICE_TYPES.TV.id,
    homeId: "home001",
    online: true,
    status: false,
    createdAt: "2023-01-20T14:30:00Z",
    lastActive: "2023-09-14T21:45:00Z",
    ip: "192.168.1.103",
    mac: "AA:BB:CC:DD:EE:03",
    firmware: "v2.1.0",
    properties: {
      volume: 30,
      channel: 5,
      source: "hdmi1",
    },
  },
  {
    id: "device004",
    name: "空调",
    type: DEVICE_TYPES.AC.id,
    homeId: "home001",
    online: true,
    status: true,
    createdAt: "2023-01-20T14:35:00Z",
    lastActive: "2023-09-15T16:20:00Z",
    ip: "192.168.1.104",
    mac: "AA:BB:CC:DD:EE:04",
    firmware: "v1.5.2",
    properties: {
      temperature: 25,
      mode: "cool",
      fanSpeed: "auto",
    },
  },

  // 家庭B的设备
  {
    id: "device005",
    name: "主卧灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home002",
    online: true,
    status: true,
    createdAt: "2023-02-22T09:10:00Z",
    lastActive: "2023-09-15T22:05:00Z",
    ip: "192.168.1.105",
    mac: "AA:BB:CC:DD:EE:05",
    firmware: "v1.2.5",
    properties: {
      brightness: 75,
      color: "#FFFAEE",
      colorTemperature: 3200,
    },
  },
  {
    id: "device006",
    name: "客厅灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home002",
    online: true,
    status: true,
    createdAt: "2023-02-22T09:15:00Z",
    lastActive: "2023-09-15T21:30:00Z",
    ip: "192.168.1.106",
    mac: "AA:BB:CC:DD:EE:06",
    firmware: "v1.2.5",
    properties: {
      brightness: 90,
      color: "#FFFFFF",
      colorTemperature: 5000,
    },
  },
  {
    id: "device007",
    name: "冰箱",
    type: DEVICE_TYPES.FRIDGE.id,
    homeId: "home002",
    online: true,
    status: true,
    createdAt: "2023-02-25T11:20:00Z",
    lastActive: "2023-09-15T20:00:00Z",
    ip: "192.168.1.107",
    mac: "AA:BB:CC:DD:EE:07",
    firmware: "v3.0.1",
    properties: {
      temperature: 4,
      mode: "normal",
      doorOpen: false,
    },
  },
  {
    id: "device008",
    name: "监控摄像头",
    type: DEVICE_TYPES.CAMERA.id,
    homeId: "home002",
    online: false,
    status: false,
    createdAt: "2023-03-01T15:45:00Z",
    lastActive: "2023-09-10T09:15:00Z",
    ip: "192.168.1.108",
    mac: "AA:BB:CC:DD:EE:08",
    firmware: "v2.2.0",
    properties: {
      resolution: "1080p",
      nightVision: true,
      angle: 0,
    },
  },
  {
    id: "device009",
    name: "电视",
    type: DEVICE_TYPES.TV.id,
    homeId: "home002",
    online: true,
    status: false,
    createdAt: "2023-03-02T10:30:00Z",
    lastActive: "2023-09-14T22:10:00Z",
    ip: "192.168.1.109",
    mac: "AA:BB:CC:DD:EE:09",
    firmware: "v2.1.5",
    properties: {
      volume: 25,
      channel: 8,
      source: "hdmi2",
    },
  },

  // 家庭C的设备
  {
    id: "device010",
    name: "客厅灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home003",
    online: true,
    status: true,
    createdAt: "2023-03-10T13:25:00Z",
    lastActive: "2023-09-15T19:45:00Z",
    ip: "192.168.1.110",
    mac: "AA:BB:CC:DD:EE:10",
    firmware: "v1.3.0",
    properties: {
      brightness: 85,
      color: "#FFFFFF",
      colorTemperature: 4200,
    },
  },
  {
    id: "device011",
    name: "主卧灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home003",
    online: true,
    status: false,
    createdAt: "2023-03-10T13:30:00Z",
    lastActive: "2023-09-15T23:00:00Z",
    ip: "192.168.1.111",
    mac: "AA:BB:CC:DD:EE:11",
    firmware: "v1.3.0",
    properties: {
      brightness: 60,
      color: "#FFF5E0",
      colorTemperature: 2700,
    },
  },
  {
    id: "device012",
    name: "书房灯",
    type: DEVICE_TYPES.LIGHT.id,
    homeId: "home003",
    online: true,
    status: true,
    createdAt: "2023-03-10T13:35:00Z",
    lastActive: "2023-09-15T23:30:00Z",
    ip: "192.168.1.112",
    mac: "AA:BB:CC:DD:EE:12",
    firmware: "v1.3.0",
    properties: {
      brightness: 100,
      color: "#FFFFFF",
      colorTemperature: 5500,
    },
  },
  {
    id: "device013",
    name: "空调",
    type: DEVICE_TYPES.AC.id,
    homeId: "home003",
    online: true,
    status: true,
    createdAt: "2023-03-15T10:15:00Z",
    lastActive: "2023-09-15T18:40:00Z",
    ip: "192.168.1.113",
    mac: "AA:BB:CC:DD:EE:13",
    firmware: "v1.6.0",
    properties: {
      temperature: 23,
      mode: "cool",
      fanSpeed: "medium",
    },
  },
  {
    id: "device014",
    name: "监控摄像头",
    type: DEVICE_TYPES.CAMERA.id,
    homeId: "home003",
    online: true,
    status: true,
    createdAt: "2023-03-20T14:50:00Z",
    lastActive: "2023-09-15T20:30:00Z",
    ip: "192.168.1.114",
    mac: "AA:BB:CC:DD:EE:14",
    firmware: "v2.3.1",
    properties: {
      resolution: "4K",
      nightVision: true,
      angle: 45,
    },
  },
  {
    id: "device015",
    name: "智能门锁",
    type: DEVICE_TYPES.OTHER.id,
    homeId: "home003",
    online: true,
    status: true,
    createdAt: "2023-03-25T09:20:00Z",
    lastActive: "2023-09-15T22:15:00Z",
    ip: "192.168.1.115",
    mac: "AA:BB:CC:DD:EE:15",
    firmware: "v1.1.2",
    properties: {
      locked: true,
      battery: 89,
      autoLock: true,
    },
  },
];

// 生成随机的设备日志
export const deviceLogs = [];

// 生成随机的日志数据
function generateRandomLogs() {
  // 清空现有日志
  deviceLogs.length = 0;

  // 用于生成随机日期的函数
  const randomDate = (start, end) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  // 为每个设备生成5-15条随机日志
  devices.forEach((device) => {
    // 确定每个设备的日志数量（5-15条）
    const logCount = 5 + Math.floor(Math.random() * 11);

    // 每台设备一定会有一条启动日志
    deviceLogs.push({
      id: uuidv4(),
      deviceId: device.id,
      type: LOG_TYPES.INFO,
      timestamp: new Date(device.createdAt),
      content: "设备启动",
      operator: "system",
    });

    // 生成随机日志
    for (let i = 1; i < logCount; i++) {
      // 随机确定日志类型
      const logTypeKeys = Object.keys(LOG_TYPES);
      const randomLogType =
        LOG_TYPES[logTypeKeys[Math.floor(Math.random() * logTypeKeys.length)]];

      // 生成随机日期，在设备创建日期和当前日期之间
      const randomTimestamp = randomDate(
        new Date(device.createdAt),
        new Date()
      );

      // 获取该设备所属家庭的随机一个用户
      const homeUsers = users.filter((user) => user.homeId === device.homeId);
      const randomUser =
        homeUsers[Math.floor(Math.random() * homeUsers.length)];

      // 根据日志类型和设备类型生成日志内容
      let logContent = "";
      let operator = "";

      if (randomLogType === LOG_TYPES.INFO) {
        const infoContents = [
          "设备连接成功",
          "设备配置更新",
          "设备固件检查",
          "设备恢复正常",
        ];
        logContent =
          infoContents[Math.floor(Math.random() * infoContents.length)];
        operator = "system";
      } else if (randomLogType === LOG_TYPES.WARNING) {
        const warningContents = [
          "设备响应缓慢",
          "设备温度偏高",
          "设备连接不稳定",
          "网络信号弱",
        ];
        logContent =
          warningContents[Math.floor(Math.random() * warningContents.length)];
        operator = "system";
      } else if (randomLogType === LOG_TYPES.ERROR) {
        const errorContents = [
          "设备连接失败",
          "设备通信中断",
          "设备固件升级失败",
          "设备重启异常",
        ];
        logContent =
          errorContents[Math.floor(Math.random() * errorContents.length)];
        operator = "system";
      } else if (randomLogType === LOG_TYPES.STATUS) {
        // 根据设备类型生成状态变化日志
        if (device.type === DEVICE_TYPES.LIGHT.id) {
          const statusContents = [
            `设备状态变更: ${Math.random() > 0.5 ? "开启" : "关闭"}`,
            `亮度调整: ${Math.floor(Math.random() * 100)}%`,
            `色温调整: ${2700 + Math.floor(Math.random() * 3000)}K`,
          ];
          logContent =
            statusContents[Math.floor(Math.random() * statusContents.length)];
        } else if (device.type === DEVICE_TYPES.AC.id) {
          const modes = ["制冷", "制热", "除湿", "送风", "自动"];
          const fanSpeeds = ["自动", "低速", "中速", "高速"];
          const statusContents = [
            `设备状态变更: ${Math.random() > 0.5 ? "开启" : "关闭"}`,
            `温度调整: ${16 + Math.floor(Math.random() * 15)}°C`,
            `模式切换: ${modes[Math.floor(Math.random() * modes.length)]}`,
            `风速调整: ${
              fanSpeeds[Math.floor(Math.random() * fanSpeeds.length)]
            }`,
          ];
          logContent =
            statusContents[Math.floor(Math.random() * statusContents.length)];
        } else if (device.type === DEVICE_TYPES.TV.id) {
          const sources = ["TV", "HDMI1", "HDMI2", "HDMI3"];
          const statusContents = [
            `设备状态变更: ${Math.random() > 0.5 ? "开启" : "关闭"}`,
            `音量调整: ${Math.floor(Math.random() * 100)}`,
            `频道切换: ${Math.floor(Math.random() * 200)}`,
            `信号源切换: ${
              sources[Math.floor(Math.random() * sources.length)]
            }`,
          ];
          logContent =
            statusContents[Math.floor(Math.random() * statusContents.length)];
        } else {
          logContent = `设备状态变更: ${Math.random() > 0.5 ? "开启" : "关闭"}`;
        }
        operator = randomUser.name;
      }

      // 创建日志记录
      deviceLogs.push({
        id: uuidv4(),
        deviceId: device.id,
        type: randomLogType,
        timestamp: randomTimestamp,
        content: logContent,
        operator: operator,
      });
    }
  });

  // 按时间排序日志
  deviceLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 初始化生成随机日志
generateRandomLogs();

// token存储
export const tokens = {
  // key: token, value: {userId, expiresAt}
};

// token过期时间（毫秒），默认2小时
export const TOKEN_EXPIRE_MS = 2 * 60 * 60 * 1000;

// 生成新token
export function generateToken(userId) {
  // 生成一个随机token
  const token = uuidv4().replace(/-/g, "");

  // 设置过期时间
  const expiresAt = new Date().getTime() + TOKEN_EXPIRE_MS;

  // 保存token
  tokens[token] = {
    userId,
    expiresAt,
  };

  return {
    token,
    expiresIn: TOKEN_EXPIRE_MS / 1000,
  };
}

// 验证token
export function validateToken(token) {
  if (!tokens[token]) {
    return { valid: false, reason: "token不存在" };
  }

  const now = new Date().getTime();
  if (now > tokens[token].expiresAt) {
    // 自动清理过期token
    delete tokens[token];
    return { valid: false, reason: "token已过期" };
  }

  return { valid: true, userId: tokens[token].userId };
}

// 刷新token
export function refreshToken(oldToken) {
  const validation = validateToken(oldToken);
  if (!validation.valid) {
    return null;
  }

  // 删除旧token
  const userId = tokens[oldToken].userId;
  delete tokens[oldToken];

  // 生成新token
  return generateToken(userId);
}

// 清除用户token
export function clearUserTokens(userId) {
  // 清除该用户的所有token
  Object.keys(tokens).forEach((token) => {
    if (tokens[token].userId === userId) {
      delete tokens[token];
    }
  });
}

// 通过token获取用户
export function getUserByToken(token) {
  const validation = validateToken(token);
  if (!validation.valid) {
    return null;
  }

  return users.find((user) => user.id === validation.userId);
}

// 根据用户ID获取家庭信息
export function getHomeByUserId(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  return homes.find((home) => home.id === user.homeId);
}

// 获取家庭成员
export function getHomeMembers(homeId) {
  return users.filter((user) => user.homeId === homeId);
}

// 获取家庭的所有设备
export function getHomeDevices(homeId) {
  return devices.filter((device) => device.homeId === homeId);
}

// 获取设备详情
export function getDeviceById(deviceId) {
  return devices.find((device) => device.id === deviceId);
}

// 获取设备日志
export function getDeviceLogs(deviceId, filters = {}) {
  let logs = deviceLogs.filter((log) => log.deviceId === deviceId);

  // 应用类型过滤
  if (filters.type) {
    logs = logs.filter((log) => log.type === filters.type);
  }

  // 应用日期范围过滤
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);

    logs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // 按时间排序
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return logs;
}

// 获取设备统计信息
export function getDeviceStats(homeId) {
  const homeDevices = getHomeDevices(homeId);
  return {
    total: homeDevices.length,
    online: homeDevices.filter((device) => device.online).length,
    offline: homeDevices.filter((device) => !device.online).length,
  };
}

// 切换设备状态
export function toggleDevice(deviceId) {
  const device = getDeviceById(deviceId);
  if (!device) return null;

  // 只有在线设备可以切换状态
  if (device.online) {
    device.status = !device.status;
    device.lastActive = new Date().toISOString();

    // 添加一条状态变更日志
    deviceLogs.unshift({
      id: uuidv4(),
      deviceId: device.id,
      type: LOG_TYPES.STATUS,
      timestamp: new Date(),
      content: `设备状态变更: ${device.status ? "开启" : "关闭"}`,
      operator: "用户操作",
    });

    return device;
  }

  return null;
}

// 更新设备属性
export function updateDeviceProperty(deviceId, property, value) {
  const device = getDeviceById(deviceId);
  if (!device || !device.online) return null;

  device.lastActive = new Date().toISOString();

  if (device.properties && device.properties[property] !== undefined) {
    device.properties[property] = value;

    // 添加一条属性变更日志
    deviceLogs.unshift({
      id: uuidv4(),
      deviceId: device.id,
      type: LOG_TYPES.STATUS,
      timestamp: new Date(),
      content: `${property}调整: ${value}`,
      operator: "用户操作",
    });

    return device;
  }

  return null;
}
