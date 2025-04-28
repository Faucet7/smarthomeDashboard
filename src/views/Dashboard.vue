<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <el-button @click="toggleSidebar" text>
        <el-icon size="24px"><Menu /></el-icon>
      </el-button>
      <div class="page-title">{{ pageTitle }}</div>
      <div class="user-info" @click="$router.push('/user')">
        <el-avatar
          :size="32"
          src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        />
        <span class="username">{{ userInfo.username }}</span>
      </div>
    </div>

    <!-- 下方内容区域 -->
    <div class="content-container">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ 'sidebar-open': drawer }">
        <div class="drawer-header">
          <!-- <img src="@/assets/logo.png" class="logo" alt="Logo" /> -->
          <h2 style="margin: 0 auto">智能家居</h2>
        </div>
        <el-menu
          router
          :default-active="activeMenu"
          class="side-menu"
          background-color="#ffffff"
          text-color="#303133"
          active-text-color="#409eff"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>控制面板</span>
          </el-menu-item>
          <el-menu-item index="/devices">
            <el-icon><Monitor /></el-icon>
            <span>设备管理</span>
          </el-menu-item>
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <span>家庭信息</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <span>用户中心</span>
          </el-menu-item>
          <el-menu-item @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 移动端遮罩层 -->
      <div
        v-if="drawer && isMobile"
        class="mobile-overlay"
        @click="toggleSidebar"
      ></div>

      <!-- 主要内容区域 -->
      <div class="main-content" :class="{ 'sidebar-open': drawer }">
        <div class="dashboard">
          <!-- 使用条件渲染，当显示子路由时隐藏仪表盘内容 -->
          <router-view v-if="isChildRoute" v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
          <template v-else>
            <div class="welcome-section">
              <div class="welcome-header">
                <h2>欢迎回来，{{ userData.username || "用户" }}</h2>
              </div>
              <p>{{ getGreeting() }}</p>
            </div>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="home-summary">
                  <template #header>
                    <div class="card-header">
                      <div class="card-title">
                        <el-icon><House /></el-icon>
                        <span>家庭信息</span>
                      </div>
                      <el-button text @click="$router.push('/home')">
                        <el-icon><ArrowRight /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  <div class="home-info">
                    <el-icon size="36px"><House /></el-icon>
                    <div class="info-details">
                      <h3>{{ homeData.name || "我的家" }}</h3>
                      <p>ID: {{ homeData.id || "N/A" }}</p>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="device-summary">
                  <template #header>
                    <div class="card-header">
                      <div class="card-title">
                        <el-icon><Monitor /></el-icon>
                        <span>设备概览</span>
                      </div>
                      <el-button text @click="$router.push('/devices')">
                        <el-icon><ArrowRight /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  <div class="device-stats">
                    <div class="stat">
                      <div class="stat-value">{{ deviceStats.total }}</div>
                      <div class="stat-label">总设备</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">{{ deviceStats.online }}</div>
                      <div class="stat-label">在线</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">{{ deviceStats.offline }}</div>
                      <div class="stat-label">离线</div>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="temperature-card">
                  <template #header>
                    <div class="card-header">
                      <div class="card-title">
                        <el-icon><Sunny /></el-icon>
                        <span>室内温度</span>
                      </div>
                    </div>
                  </template>
                  <div class="temp-display">
                    <el-icon size="36px"><Sunny /></el-icon>
                    <div class="temp-value">24°C</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="humidity-card">
                  <template #header>
                    <div class="card-header">
                      <div class="card-title">
                        <el-icon><Cloudy /></el-icon>
                        <span>室内湿度</span>
                      </div>
                    </div>
                  </template>
                  <div class="temp-display">
                    <el-icon size="36px"><Cloudy /></el-icon>
                    <div class="temp-value">58%</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <h3 class="section-title">
              <el-icon><Connection /></el-icon>
              <span>常用设备</span>
            </h3>

            <el-row :gutter="20">
              <el-col
                v-for="device in frequentDevices"
                :key="device.id"
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
              >
                <el-card
                  class="device-card"
                  :class="{ 'device-offline': !device.online }"
                  :data-type="device.type"
                  @click="navigateToDeviceDetail(device.id)"
                >
                  <div class="device-icon">
                    <el-icon
                      ><component :is="getDeviceIcon(device.type)"
                    /></el-icon>
                  </div>
                  <div class="device-info">
                    <div class="device-name">{{ device.name }}</div>
                    <div
                      class="device-status"
                      :class="
                        device.online ? 'status-online' : 'status-offline'
                      "
                    >
                      {{ device.online ? "在线" : "离线" }}
                    </div>
                  </div>
                  <div class="device-controls">
                    <el-switch
                      v-model="device.power"
                      :disabled="!device.online"
                      @click.stop
                      @change="toggleDevice(device)"
                    />
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeFilled,
  House,
  ArrowRight,
  Sunny,
  Cloudy,
  Monitor,
  Refrigerator,
  Cpu,
  VideoCamera,
  User,
  SwitchButton,
  Menu,
  Connection,
  Avatar,
  Lightning,
  SetUp,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUserInfo, clearAuth } from "@/utils/auth";
import { getUserDetail } from "@/api/user";

// 路由实例
const router = useRouter();
const route = useRoute();

// 检查当前是否为子路由
const isChildRoute = computed(() => {
  return route.path !== "/";
});

// 是否为移动设备
const isMobile = ref(window.innerWidth < 1200);

// 侧边栏抽屉状态 - 大屏幕上默认打开，小屏幕上默认关闭
const drawer = ref(!isMobile.value);

// 切换侧边栏显示/隐藏
const toggleSidebar = () => {
  drawer.value = !drawer.value;
};

// 当前激活的菜单项
const activeMenu = computed(() => {
  // 如果是设备详情页，激活设备列表菜单
  if (route.path.includes("/devices/")) {
    return "/devices";
  }
  return route.path;
});

// 页面标题
const pageTitle = computed(() => {
  const routeMap = {
    "/": "控制面板",
    "/devices": "设备管理",
    "/home": "家庭信息",
    "/user": "用户中心",
  };

  if (route.name === "DeviceDetail") {
    return "设备详情";
  }

  if (route.name === "DeviceLog") {
    return "设备日志";
  }

  return routeMap[route.path] || "智能家居";
});

// 用户信息数据
const userInfo = ref({
  username: "用户",
  avatar: "",
});

// 用户数据（仪表盘使用）
const userData = reactive({
  username: "",
  id: "",
  homeId: "",
  identity: "",
});

// 家庭数据
const homeData = reactive({
  id: "",
  name: "我的智能家",
});

// 设备统计
const deviceStats = reactive({
  total: 8,
  online: 6,
  offline: 2,
});

// 常用设备列表
const frequentDevices = ref([
  { id: 1, name: "客厅灯", type: "light", online: true, power: true },
  { id: 2, name: "卧室灯", type: "light", online: true, power: false },
  { id: 3, name: "智能电视", type: "tv", online: true, power: false },
  { id: 4, name: "空调", type: "ac", online: true, power: true },
  { id: 5, name: "冰箱", type: "fridge", online: true, power: true },
  { id: 6, name: "监控摄像头", type: "camera", online: false, power: false },
]);

// 根据时间获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) {
    return "夜深了，注意休息";
  } else if (hour < 12) {
    return "早上好，祝您有个愉快的一天";
  } else if (hour < 18) {
    return "下午好，今天过得怎么样？";
  } else {
    return "晚上好，今天辛苦了";
  }
};

// 根据设备类型获取图标
const getDeviceIcon = (type) => {
  const iconMap = {
    light: Lightning,
    tv: Monitor,
    ac: Cloudy,
    fridge: Refrigerator,
    camera: VideoCamera,
    other: SetUp,
    default: Cpu,
  };
  return iconMap[type] || iconMap.default;
};

// 切换设备状态
const toggleDevice = (device) => {
  // 模拟API调用
  ElMessage.success(`${device.name}已${device.power ? "开启" : "关闭"}`);
};

// 导航到设备详情页
const navigateToDeviceDetail = (deviceId) => {
  router.push(`/devices/${deviceId}`);
};

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm("确定要退出登录吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 使用已导入的clearAuth方法
    clearAuth();
    router.push("/login");
  } catch (error) {
    // 用户取消操作
  }
};

// 加载用户信息
const loadUserInfo = () => {
  const parsedInfo = getUserInfo();
  if (parsedInfo) {
    userInfo.value.username = parsedInfo.name || parsedInfo.username || "用户";

    userData.username = parsedInfo.name || parsedInfo.username || "用户";
    userData.id = parsedInfo.id || "";
    userData.homeId = parsedInfo.homeId || "";
    userData.identity = parsedInfo.type?.name || parsedInfo.identity || "用户";

    // 更新家庭信息
    homeData.id = parsedInfo.homeId || "";
  }
};

// 获取用户详情
const fetchUserDetail = async () => {
  try {
    console.log("正在调用 /user/detail API...");
    const res = await getUserDetail();
    console.log("用户详情API返回结果:", res);

    // 如果API调用成功，打印详细信息
    if (res.status === 200) {
      console.log("用户详情数据:", res.result || res.data);
    } else {
      console.error("获取用户详情失败:", res.message || "未知错误");
    }
  } catch (error) {
    console.error("调用用户详情API出错:", error);

    // 打印更详细的错误信息
    if (error.response) {
      console.error("错误状态码:", error.response.status);
      console.error("错误数据:", error.response.data);
    }
  }
};

// 监听窗口大小变化
const resizeHandler = () => {
  isMobile.value = window.innerWidth < 1200;

  // 在大屏幕上默认显示侧边栏，在小屏幕上默认隐藏
  if (isMobile.value && drawer.value) {
    drawer.value = false;
  } else if (!isMobile.value && !drawer.value) {
    drawer.value = true;
  }
};

onMounted(() => {
  // 加载用户信息
  loadUserInfo();

  // 调用用户详情API
  fetchUserDetail();

  // 监听窗口大小变化，自动调整侧边栏状态
  window.addEventListener("resize", resizeHandler);

  // 这里可以获取更多的家庭数据和设备数据
});

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener("resize", resizeHandler);
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
  position: relative;
  overflow-x: hidden;
}

/* 顶部导航栏样式 */
.top-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 56px;
}

/* 下方内容区域 */
.content-container {
  display: flex;
  flex: 1;
  margin-top: 56px; /* 顶部导航栏的高度 */
  height: calc(100vh - 56px);
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  height: 100%;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
  transition: width 0.3s ease, box-shadow 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.sidebar.sidebar-open {
  width: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.drawer-header,
.side-menu {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar.sidebar-open .drawer-header,
.sidebar.sidebar-open .side-menu {
  opacity: 1;
  transition: opacity 0.3s ease 0.1s;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  transition: width 0.3s ease, padding 0.3s ease;
  width: 100%;
  min-height: calc(100vh - 56px); /* 减去顶部导航栏的高度 */
}

.drawer-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #ebeef5;
  width: 250px;
}

.logo {
  width: 40px;
  height: 40px;
}

.side-menu {
  border-right: none;
  width: 250px;
}

.username {
  font-size: 14px;
  color: #606266;
  display: none;
}

@media (min-width: 768px) {
  .username {
    display: inline;
  }
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 1200px) {
  /* 大屏幕默认显示侧边栏 */
  .sidebar.sidebar-open {
    width: 250px;
  }

  /* 侧边栏打开时，主内容区域调整宽度 */
  .main-content.sidebar-open {
    width: calc(100% - 250px);
  }
}

@media (max-width: 1199px) {
  /* 中小屏幕上，侧边栏为绝对定位 */
  .sidebar.sidebar-open {
    position: absolute;
    width: 240px;
    z-index: 15;
  }

  /* 中小屏幕上，即使侧边栏打开，主内容区域也占据全宽 */
  .main-content.sidebar-open {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }

  .welcome-section {
    padding: 15px;
  }

  .welcome-section h2 {
    font-size: 20px;
  }

  .welcome-section p {
    font-size: 14px;
  }

  .section-title {
    font-size: 16px;
    margin: 20px 0 15px;
  }

  .device-card {
    height: 140px;
  }

  .stat-value,
  .temp-value {
    font-size: 22px;
  }
}

:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-button) {
  margin-top: 0;
  margin-right: 0;
}

/* Dashboard 组件优化样式 */
.dashboard {
  padding-bottom: 40px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 30px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.welcome-section h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.welcome-section p {
  margin: 8px 0 0;
  color: #606266;
  font-size: 15px;
}

/* 卡片样式优化 */
:deep(.el-card) {
  height: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
}

:deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-title .el-icon {
  font-size: 18px;
  color: #409eff;
}

/* 首行卡片高度统一 */
.home-summary,
.device-summary,
.temperature-card,
.humidity-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 统一卡片内容高度 */
:deep(.el-row) {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0 !important;
}

:deep(.el-col) {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

/* 家庭信息卡片 */
.home-info {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
  padding: 10px 0;
}

.home-info .el-icon {
  background-color: #f0f7ff;
  padding: 10px;
  border-radius: 50%;
  color: #409eff;
}

.info-details {
  flex: 1;
}

.info-details h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 500;
}

.info-details p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

/* 设备统计卡片 */
.device-stats {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 10px 0;
}

.stat {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 温度湿度卡片 */
.temp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  height: 100%;
  padding: 10px 0;
}

.temp-display .el-icon {
  background-color: #f0f7ff;
  padding: 10px;
  border-radius: 50%;
  color: #409eff;
}

.temperature-card .temp-display .el-icon {
  color: #ff9900;
  background-color: #fff9f0;
}

.humidity-card .temp-display .el-icon {
  color: #409eff;
  background-color: #f0f7ff;
}

.temp-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.section-title {
  margin: 30px 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 15px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  font-size: 20px;
  color: #409eff;
}

/* 设备卡片 */
.device-card {
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-offline {
  opacity: 0.7;
}

.device-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}

.device-icon .el-icon {
  font-size: 28px;
  background-color: #f0f7ff;
  height: 1.5em;
  width: 1.5em;
  padding: 12px;
  border-radius: 50%;
  color: #409eff;
  transition: all 0.3s ease;
}

.device-card:hover .device-icon .el-icon {
  transform: scale(1.1);
}

.device-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 不同设备类型的图标样式 */
.device-card[data-type="light"] .device-icon .el-icon {
  color: #ff9900;
  background-color: #fff9f0;
}

.device-card[data-type="tv"] .device-icon .el-icon {
  color: #67c23a;
  background-color: #f0f9eb;
}

.device-card[data-type="ac"] .device-icon .el-icon {
  color: #409eff;
  background-color: #ecf5ff;
}

.device-card[data-type="fridge"] .device-icon .el-icon {
  color: #909399;
  background-color: #f4f4f5;
}

.device-card[data-type="camera"] .device-icon .el-icon {
  color: #f56c6c;
  background-color: #fef0f0;
}

.device-info {
  text-align: center;
  margin-bottom: 15px;
}

.device-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 5px;
}

.status-online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-offline {
  background-color: #f4f4f5;
  color: #909399;
}

.device-offline .device-status {
  background-color: #f4f4f5;
  color: #909399;
}

.device-controls {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 56px; /* 顶部导航栏的高度 */
  left: 0;
  width: 100%;
  height: calc(100% - 56px);
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 14;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-header .el-icon {
  font-size: 28px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 10px;
  border-radius: 50%;
}
</style>
