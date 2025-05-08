import { v4 as uuidv4 } from "uuid";
import { users, validateToken, getUserByToken, USER_TYPES } from "./data";

// 设置用户相关的mock API
export function setupUserMocks(mock) {
  // 获取用户信息API
  mock.onGet("/user/info").reply((config) => {
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

      return [
        200,
        {
          status: 200,
          message: "获取用户信息成功",
          result: {
            id: user.id,
            username: user.username,
            name: user.name,
            type: user.type,
            homeId: user.homeId,
            lastLoginTime: user.lastLoginTime,
            createdAt: user.createdAt,
          },
        },
      ];
    } catch (error) {
      console.error("Get user info mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 获取用户详情API
  mock.onGet("/user/detail").reply((config) => {
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

      // 构建更详细的用户信息
      const userDetail = {
        id: user.id,
        username: user.username,
        name: user.name,
        type: user.type,
        homeId: user.homeId,
        lastLoginTime: user.lastLoginTime,
        createdAt: user.createdAt,
        // 额外详细信息
        email: `${user.username}@example.com`,
        phone: `1388888${user.id.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        preferences: {
          theme: "light",
          language: "zh-CN",
          notifications: true,
        },
      };

      return [
        200,
        {
          status: 200,
          message: "获取用户详情成功",
          result: {
            user: userDetail,
          },
        },
      ];
    } catch (error) {
      console.error("Get user detail mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 更新用户信息API
  mock.onPost("/user/update").reply((config) => {
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
      const updateData = JSON.parse(config.data);

      // 更新用户信息（只允许更新某些字段）
      if (updateData.name) {
        user.name = updateData.name;
      }

      // 在实际应用中，这里可能会有更多的字段可以更新

      return [
        200,
        {
          status: 200,
          message: "用户信息更新成功",
          result: {
            id: user.id,
            username: user.username,
            name: user.name,
            type: user.type,
            homeId: user.homeId,
          },
        },
      ];
    } catch (error) {
      console.error("Update user info mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 用户注册API
  mock.onPost("/user/register").reply((config) => {
    try {
      // 解析请求数据
      const { username, password, homeId } = JSON.parse(config.data);

      // 验证必要字段
      if (!username || !password) {
        return [
          400,
          {
            status: 400,
            message: "用户名和密码不能为空",
            code: "invalid_params",
          },
        ];
      }

      // 检查用户名是否已存在
      const existingUser = users.find((u) => u.username === username);
      if (existingUser) {
        return [
          409,
          { status: 409, message: "用户名已存在", code: "username_exists" },
        ];
      }

      // 检查家庭ID是否有效
      // 在实际应用中，这里可能会有更多的验证

      // 创建新用户
      const newUser = {
        id: `user${uuidv4().slice(0, 8)}`,
        username,
        password,
        name: username, // 初始名称与用户名相同
        homeId: homeId || "home001", // 如果没有指定家庭ID，默认使用第一个家庭
        type: USER_TYPES.MEMBER, // 新注册用户默认为普通成员
        lastLoginTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // 添加到用户列表
      users.push(newUser);

      return [
        200,
        {
          status: 200,
          message: "注册成功",
          result: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            type: newUser.type,
            homeId: newUser.homeId,
          },
        },
      ];
    } catch (error) {
      console.error("Register user mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });

  // 添加修改密码的API
  mock.onPost("/user/change-password").reply((config) => {
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
      const { currentPassword, newPassword } = JSON.parse(config.data);

      // 验证必要字段
      if (!currentPassword || !newPassword) {
        return [
          400,
          {
            status: 400,
            message: "当前密码和新密码不能为空",
            code: "invalid_params",
          },
        ];
      }

      // 验证当前密码是否正确
      if (user.password !== currentPassword) {
        return [
          400,
          { status: 400, message: "当前密码不正确", code: "invalid_password" },
        ];
      }

      // 更新用户密码
      user.password = newPassword;

      return [
        200,
        {
          status: 200,
          message: "密码修改成功",
          result: {
            success: true,
          },
        },
      ];
    } catch (error) {
      console.error("Change password mock error:", error);
      return [500, { status: 500, message: "服务器内部错误" }];
    }
  });
}
