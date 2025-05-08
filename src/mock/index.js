import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { setupAuthMocks } from "./auth";
import { setupUserMocks } from "./user";
import { setupHomeMocks } from "./home";
import { setupDeviceMocks } from "./device";

// 创建一个mock适配器实例
const mock = new MockAdapter(axios, {
  delayResponse: 500, // 模拟网络延迟
  onNoMatch: "passthrough", // 没有匹配到的请求将被传递给真实服务器
});

// 初始化mock数据和API
export function setupMocks() {
  console.log("Setting up mock services...");

  // 设置auth相关的mock
  setupAuthMocks(mock);

  // 设置user相关的mock
  setupUserMocks(mock);

  // 设置home相关的mock
  setupHomeMocks(mock);

  // 设置device相关的mock
  setupDeviceMocks(mock);

  console.log("Mock services are ready!");
}

// 暴露mock实例，以便在需要时可以重置或修改
export { mock };
