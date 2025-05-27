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
            <div style="display: flex; flex-direction: row; width: 100%">
              <div class="welcome-section">
                <div class="welcome-header">
                  <h2>欢迎回来，{{ userData.username || "用户" }}</h2>
                </div>
                <p>{{ getGreeting() }}</p>
              </div>
              <el-card class="stat-card">
                <template #header>
                  <div class="card-header">
                    <div class="card-title">
                      <el-icon><Monitor /></el-icon>
                      <span>设备概览</span>
                    </div>
                  </div>
                </template>
                <div class="stat-content">
                  <div class="stat-item">
                    <div class="stat-value">{{ deviceStats.total }}</div>
                    <div class="stat-label">总设备</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value online">
                      {{ deviceStats.online }}
                    </div>
                    <div class="stat-label">在线</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value offline">
                      {{ deviceStats.offline }}
                    </div>
                    <div class="stat-label">离线</div>
                  </div>
                </div>
              </el-card>
            </div>

            <div class="dashboard-row">
              <el-row :gutter="24" class="dashboard-cards-row">
                <el-col :xs="24" :sm="12">
                  <el-card class="dashboard-card temperature-card">
                    <template #header>
                      <div class="card-header">
                        <div class="card-title">
                          <el-icon><Sunny /></el-icon>
                          <span>室内温度</span>
                        </div>
                        <div class="chart-value">
                          {{
                            temperatureData.length
                              ? temperatureData[temperatureData.length - 1]
                                  .value + "°C"
                              : "--"
                          }}
                        </div>
                      </div>
                    </template>
                    <div class="chart-content">
                      <v-chart
                        v-if="temperatureOption && temperatureOption.series"
                        :option="temperatureOption"
                        style="height: 250px; width: 100%"
                      />
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-card class="dashboard-card humidity-card">
                    <template #header>
                      <div class="card-header">
                        <div class="card-title">
                          <el-icon><Cloudy /></el-icon>
                          <span>室内湿度</span>
                        </div>
                        <div class="chart-value">
                          {{
                            humidityData.length
                              ? humidityData[humidityData.length - 1].value +
                                "%"
                              : "--"
                          }}
                        </div>
                      </div>
                    </template>
                    <div class="chart-content">
                      <v-chart
                        v-if="humidityOption && humidityOption.series"
                        :option="humidityOption"
                        style="height: 250px; width: 100%"
                      />
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

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
import {
  getDeviceStats,
  getDeviceList,
  toggleDevice as toggleDeviceApi,
  getDeviceProperties,
} from "@/api/device";
import VChart from "vue-echarts";
import * as echarts from "echarts";

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

// 设备统计
const deviceStats = reactive({
  total: 0,
  online: 0,
  offline: 0,
});

// 常用设备列表 - 默认为空，通过API获取数据
const frequentDevices = ref([]);

// 温湿度图表相关
const temperatureData = ref([]);
const humidityData = ref([]);
const temperatureOption = ref({});
const humidityOption = ref({});

// 示例设备ID
const temperatureDeviceId = "front_temperature";
const humidityDeviceId = "front_humidity";

// 格式化时间戳为HH:mm
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts));
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// 获取温度历史数据并渲染图表
const fetchTemperatureData = async () => {
  try {
    const res = await getDeviceProperties(temperatureDeviceId, "value");
    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      // 按时间升序排列，取最近25条
      const sorted = [...res.result.data].sort(
        (a, b) => (a.timestamp || a.createTime) - (b.timestamp || b.createTime)
      );
      const recent = sorted.slice(-25);
      temperatureData.value = recent.map((item) => ({
        time: formatTime(item.timestamp || item.createTime),
        value: item.value,
      }));
      temperatureOption.value = {
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: temperatureData.value.map((d) => d.time),
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
            interval: 1,
            hideOverlap: false,
          },
          axisLine: { lineStyle: { color: "#409eff", width: 2 } },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
          },
          name: "°C",
          nameTextStyle: { fontSize: 18, color: "#409eff", fontWeight: 700 },
          splitLine: { lineStyle: { color: "#eee", type: "dashed" } },
        },
        series: [
          {
            data: temperatureData.value.map((d) => d.value),
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: { color: "#ff9900", width: 4 },
            itemStyle: {
              color: "#ff9900",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: { color: "rgba(255,153,0,0.10)" },
          },
        ],
        grid: { left: 30, right: 20, top: 35, bottom: 50 },
      };
    }
  } catch (e) {
    temperatureData.value = [];
    temperatureOption.value = {};
  }
};

// 获取湿度历史数据并渲染图表
const fetchHumidityData = async () => {
  try {
    const res = await getDeviceProperties(humidityDeviceId, "value");
    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      // 按时间升序排列，取最近25条
      const sorted = [...res.result.data].sort(
        (a, b) => (a.timestamp || a.createTime) - (b.timestamp || b.createTime)
      );
      const recent = sorted.slice(-25);
      humidityData.value = recent.map((item) => ({
        time: formatTime(item.timestamp || item.createTime),
        value: item.value,
      }));
      humidityOption.value = {
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: humidityData.value.map((d) => d.time),
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
            interval: 1,
            hideOverlap: false,
          },
          axisLine: { lineStyle: { color: "#409eff", width: 2 } },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 30,
          },
          name: "%",
          nameTextStyle: {
            fontSize: 18,
            color: "#409eff",
            fontWeight: 700,
            top: "100%",
          },
          splitLine: { lineStyle: { color: "#eee", type: "dashed" } },
        },
        series: [
          {
            data: humidityData.value.map((d) => d.value),
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: { color: "#409eff", width: 4 },
            itemStyle: {
              color: "#409eff",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: { color: "rgba(64,158,255,0.10)" },
          },
        ],
        grid: { left: 30, right: 20, top: 35, bottom: 50 },
      };
    }
  } catch (e) {
    humidityData.value = [];
    humidityOption.value = {};
  }
};

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
const toggleDevice = async (device) => {
  try {
    const res = await toggleDeviceApi(device.id);
    if (res.status === 200) {
      ElMessage.success(
        res.message || `${device.name}已${device.status ? "开启" : "关闭"}`
      );
      // 更新设备状态
      device.status = res.result.device.status;
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("切换设备状态失败:", error);
    ElMessage.error("操作失败，请稍后再试");
  }
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

    // 加载设备统计和设备列表
    loadDeviceStats();
    loadDeviceList();
  }
};

// 加载设备统计信息
const loadDeviceStats = async () => {
  try {
    const res = await getDeviceList();
    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      const devices = res.result.data;
      deviceStats.total = devices.length;
      deviceStats.online = devices.filter(
        (d) => d.state && d.state.value === "online"
      ).length;
      deviceStats.offline = devices.filter(
        (d) => d.state && d.state.value === "offline"
      ).length;
    }
  } catch (error) {
    console.error("加载设备统计信息失败:", error);
  }
};

// 加载设备列表
const loadDeviceList = async () => {
  try {
    const res = await getDeviceList();
    if (res.status === 200 && res.result.devices) {
      // 获取全部设备
      const devices = res.result.devices;
      // 过滤出在线设备，并限制为最多6个
      frequentDevices.value = devices
        .filter((device) => device.online || devices.length <= 6)
        .slice(0, 6)
        .map((device) => ({
          id: device.id,
          name: device.name,
          type: device.type,
          online: device.online,
          power: device.status,
          status: device.status,
        }));
    }
  } catch (error) {
    console.error("加载设备列表失败:", error);
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

  // 监听窗口大小变化，自动调整侧边栏状态
  window.addEventListener("resize", resizeHandler);

  fetchTemperatureData();
  fetchHumidityData();
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
  position: fixed;
  left: 0;
  z-index: 10;
  width: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  white-space: nowrap;
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
  background: url("@/assets/image.png") no-repeat center center;
  background-size: cover;
  overflow-y: auto;
  box-sizing: border-box;
  transition: width 0.3s ease, padding 0.3s ease, margin-left 0.3s;
  width: 100%;
  min-height: calc(100vh - 56px);
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

/* 侧边栏展开时，主内容区域缩小 */
@media (min-width: 1200px) {
  .sidebar.sidebar-open ~ .main-content {
    width: calc(100% - 250px);
    margin-left: 250px;
  }
}

@media (max-width: 1199px) {
  .sidebar.sidebar-open {
    position: absolute;
    width: 240px;
    z-index: 15;
  }
  .main-content.sidebar-open {
    width: 100%;
    margin-left: 0;
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
    font-size: 40px;
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
  background-color: rgba(255, 255, 255, 0.7);
  margin: 10px 12px;
  padding: 20px;
  width: 70%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.welcome-section h2 {
  margin: 0;
  font-size: 40px;
  font-weight: 600;
  color: #303133;
}

.welcome-section p {
  margin: 8px 0 0;
  color: #606266;
  font-size: 20px;
}

/* 卡片样式优化 */
:deep(.el-card) {
  height: max(fit-content, 350px);
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.7);
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
  font-size: 20px;

  font-weight: 600;
}

.card-title .el-icon {
  margin-right: 10px;
  font-size: 30px;
  color: #409eff;
}

/* 首行卡片高度统一 */
.device-summary,
.temperature-card,
.humidity-card {
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
  font-weight: 600;
  color: #303133;
  font-size: 24px !important;
  align-items: center;
  gap: 10px;
}

.welcome-header .el-icon {
  font-size: 38px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 10px;
  border-radius: 50%;
}

.dashboard-row {
  margin-bottom: 32px;
}
.dashboard-cards-row {
  margin-bottom: 0;
}
.dashboard-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  margin-bottom: 0;
}
.stat-card {
  margin: 10px 12px;
  width: 30%;
}
.stat-card .stat-content {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  margin-top: 10px;
  gap: 8px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #409eff;
}
.stat-value.online {
  color: #67c23a;
}
.stat-value.offline {
  color: #f56c6c;
}
.stat-label {
  font-size: 14px;
  color: #909399;
}
.chart-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: fit-content;
}
.chart-content canvas {
  padding: 10px;
  height: 100%;
}
.chart-value {
  font-size: 38px;
  font-weight: 900;
  color: #ff9900;
  letter-spacing: 1px;
  line-height: 20px;
  text-shadow: 0 2px 8px rgba(255, 153, 0, 0.08);
}
.humidity-card .chart-value {
  color: #409eff;
  text-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
}
@media (max-width: 1200px) {
  .dashboard-card {
    min-height: 180px;
  }
  .stat-value,
  .chart-value {
    font-size: 22px;
  }
}
@media (max-width: 768px) {
  .dashboard-row {
    margin-bottom: 16px;
  }
  .dashboard-card {
    min-height: 120px;
    margin-bottom: 16px;
  }
  .stat-content {
    height: 80px;
  }
  /* .chart-content {
    padding-top: 0;
  } */
}
</style>
