import {
  homes,
  users,
  validateToken,
  getUserByToken,
  getHomeByUserId,
  getHomeMembers,
} from "./data";

// 设置家庭相关的mock API
export function setupHomeMocks(mock) {
  // 获取家庭信息API
  mock.onGet("/home/info").reply((config) => {
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

      // 获取家庭信息
      const home = getHomeByUserId(user.id);

      if (!home) {
        return [404, { status: 404, message: "家庭不存在", code: "not_found" }];
      }

      return [
        200,
        {
          status: 200,
          message: "获取家庭信息成功",
          result: {
            home,
          },
        },
      ];
    } catch (error) {
      console.error("Get home info mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取家庭成员列表API
  mock.onGet("/home/members").reply((config) => {
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

      // 获取家庭成员
      const members = getHomeMembers(user.homeId).map((member) => ({
        id: member.id,
        username: member.username,
        name: member.name,
        type: member.type,
        lastLoginTime: member.lastLoginTime,
        createdAt: member.createdAt,
      }));

      return [
        200,
        {
          status: 200,
          message: "获取家庭成员列表成功",
          result: {
            members,
            total: members.length,
          },
        },
      ];
    } catch (error) {
      console.error("Get home members mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 更新家庭信息API
  mock.onPost("/home/update").reply((config) => {
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

      // 验证用户权限（只有管理员可以更新家庭信息）
      if (user.type.id !== 1) {
        // ADMIN
        return [
          403,
          { status: 403, message: "没有权限更新家庭信息", code: "forbidden" },
        ];
      }

      // 获取家庭信息
      const home = getHomeByUserId(user.id);

      if (!home) {
        return [404, { status: 404, message: "家庭不存在", code: "not_found" }];
      }

      // 解析请求数据
      const updateData = JSON.parse(config.data);

      // 更新家庭信息
      if (updateData.name) {
        home.name = updateData.name;
      }

      // 更新时间
      home.updatedAt = new Date().toISOString();

      return [
        200,
        {
          status: 200,
          message: "家庭信息更新成功",
          result: {
            home,
          },
        },
      ];
    } catch (error) {
      console.error("Update home info mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });
}
