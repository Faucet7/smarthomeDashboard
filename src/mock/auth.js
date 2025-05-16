import {
  users,
  generateToken,
  validateToken as validateTokenData,
  refreshToken as refreshTokenData,
  getUserByToken,
} from "./data";

// 设置认证相关的mock API
export function setupAuthMocks(mock) {
  // 登录API
  // mock.onPost("/authorize/login").reply((config) => {
  //   try {
  //     const { username, password } = JSON.parse(config.data);
  //     // 验证用户名和密码
  //     const user = users.find(
  //       (user) => user.username === username && user.password === password
  //     );
  //     if (!user) {
  //       return [401, { status: 401, message: "用户名或密码错误" }];
  //     }
  //     // 生成token
  //     const tokenData = generateToken(user.id);
  //     // 更新最后登录时间
  //     user.lastLoginTime = new Date().toISOString();
  //     return [
  //       200,
  //       {
  //         status: 200,
  //         message: "登录成功",
  //         result: {
  //           token: tokenData.token,
  //           expiresIn: tokenData.expiresIn,
  //           userId: user.id,
  //           user: {
  //             id: user.id,
  //             username: user.username,
  //             name: user.name,
  //             type: user.type,
  //             homeId: user.homeId,
  //           },
  //         },
  //       },
  //     ];
  //   } catch (error) {
  //     console.error("Login mock error:", error);
  //     return [500, { status: 500, message: "服务器内部错误" }];
  //   }
  // });
  // 刷新token API
  // mock.onGet("/authorize/refresh").reply((config) => {
  //   try {
  //     // 从请求头获取token
  //     const token = config.headers["x-access-token"];
  //     if (!token) {
  //       return [
  //         401,
  //         { status: 401, message: "未提供token", code: "unauthorized" },
  //       ];
  //     }
  //     // 刷新token
  //     const newTokenData = refreshTokenData(token);
  //     if (!newTokenData) {
  //       return [
  //         401,
  //         { status: 401, message: "token已过期或无效", code: "unauthorized" },
  //       ];
  //     }
  //     // 获取用户信息
  //     const user = getUserByToken(newTokenData.token);
  //     return [
  //       200,
  //       {
  //         status: 200,
  //         message: "token刷新成功",
  //         result: {
  //           token: newTokenData.token,
  //           expiresIn: newTokenData.expiresIn,
  //           userId: user.id,
  //         },
  //       },
  //     ];
  //   } catch (error) {
  //     console.error("Refresh token mock error:", error);
  //     return [500, { status: 500, message: "服务器内部错误" }];
  //   }
  // });
  // 验证token API
  // mock.onGet("/authorize/validate").reply((config) => {
  //   try {
  //     // 从请求头获取token
  //     const token = config.headers["x-access-token"];
  //     if (!token) {
  //       return [
  //         401,
  //         { status: 401, message: "未提供token", code: "unauthorized" },
  //       ];
  //     }
  //     // 验证token
  //     const validation = validateTokenData(token);
  //     if (!validation.valid) {
  //       return [
  //         401,
  //         { status: 401, message: validation.reason, code: "unauthorized" },
  //       ];
  //     }
  //     return [
  //       200,
  //       {
  //         status: 200,
  //         message: "token有效",
  //         result: { valid: true },
  //       },
  //     ];
  //   } catch (error) {
  //     console.error("Validate token mock error:", error);
  //     return [500, { status: 500, message: "服务器内部错误" }];
  //   }
  // });
}
