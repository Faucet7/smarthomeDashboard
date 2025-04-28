<template>
  <div class="device-detail">
    <div class="page-header">
      <div class="back-button">
        <el-button @click="$router.back()" text>
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
      </div>
      <h2 class="device-title">{{ device.name }}</h2>
      <div
        class="device-status"
        :class="device.online ? 'status-online' : 'status-offline'"
      >
        {{ device.online ? "在线" : "离线" }}
      </div>
    </div>

    <el-tabs v-model="activeTab" class="device-tabs">
      <el-tab-pane label="设备信息" name="info">
        <el-card class="info-card">
          <div class="device-info-header">
            <div class="device-icon">
              <el-icon size="60px"
                ><component :is="getDeviceIcon(device.type)"
              /></el-icon>
            </div>
            <div class="info-actions">
              <el-button-group>
                <el-button
                  type="primary"
                  :disabled="!device.online"
                  @click="toggleDevice"
                >
                  {{ device.status ? "关闭设备" : "打开设备" }}
                </el-button>
                <el-button @click="$router.push(`/devices/${deviceId}/logs`)"
                  >设备日志</el-button
                >
                <el-button type="warning" @click="showEditDialog"
                  >编辑信息</el-button
                >
              </el-button-group>
            </div>
          </div>

          <el-descriptions
            title="基本信息"
            :column="2"
            border
            class="device-descriptions"
          >
            <el-descriptions-item label="设备ID">{{
              device.id
            }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{
              device.name
            }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{
              getDeviceTypeName(device.type)
            }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <el-tag :type="device.status ? 'success' : 'info'">
                {{ device.status ? "开启" : "关闭" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
              device.ip || "N/A"
            }}</el-descriptions-item>
            <el-descriptions-item label="MAC地址">{{
              device.mac || "N/A"
            }}</el-descriptions-item>
            <el-descriptions-item label="固件版本">{{
              device.firmware || "N/A"
            }}</el-descriptions-item>
            <el-descriptions-item label="添加时间">{{
              formatDate(device.addTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="最后活跃" :span="2">{{
              formatDate(device.lastActive)
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="控制面板" name="control">
        <el-card class="control-card">
          <template #header>
            <div class="card-header">
              <span>设备控制</span>
            </div>
          </template>

          <div v-if="device.type === 'light'" class="light-controls">
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch
                v-model="device.status"
                :disabled="!device.online"
                @change="updateDeviceStatus"
              />
            </div>

            <div class="control-item">
              <div class="control-label">亮度</div>
              <el-slider
                v-model="lightBrightness"
                :disabled="!device.online || !device.status"
                @change="updateBrightness"
              />
            </div>

            <div class="control-item">
              <div class="control-label">色温</div>
              <el-slider
                v-model="lightTemperature"
                :disabled="!device.online || !device.status"
                @change="updateTemperature"
              />
            </div>

            <div class="control-item">
              <div class="control-label">颜色</div>
              <el-color-picker
                v-model="lightColor"
                :disabled="!device.online || !device.status"
                @change="updateColor"
                show-alpha
              />
            </div>
          </div>

          <div v-else-if="device.type === 'ac'" class="ac-controls">
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch
                v-model="device.status"
                :disabled="!device.online"
                @change="updateDeviceStatus"
              />
            </div>

            <div class="control-item">
              <div class="control-label">温度</div>
              <el-input-number
                v-model="acTemperature"
                :disabled="!device.online || !device.status"
                :min="16"
                :max="30"
                @change="updateAcTemperature"
              />
            </div>

            <div class="control-item">
              <div class="control-label">模式</div>
              <el-select
                v-model="acMode"
                :disabled="!device.online || !device.status"
                @change="updateAcMode"
              >
                <el-option label="制冷" value="cool" />
                <el-option label="制热" value="heat" />
                <el-option label="自动" value="auto" />
                <el-option label="除湿" value="dry" />
                <el-option label="送风" value="fan" />
              </el-select>
            </div>

            <div class="control-item">
              <div class="control-label">风速</div>
              <el-select
                v-model="acFanSpeed"
                :disabled="!device.online || !device.status"
                @change="updateAcFanSpeed"
              >
                <el-option label="自动" value="auto" />
                <el-option label="低速" value="low" />
                <el-option label="中速" value="medium" />
                <el-option label="高速" value="high" />
              </el-select>
            </div>
          </div>

          <div v-else-if="device.type === 'tv'" class="tv-controls">
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch
                v-model="device.status"
                :disabled="!device.online"
                @change="updateDeviceStatus"
              />
            </div>

            <div class="control-item">
              <div class="control-label">音量</div>
              <el-slider
                v-model="tvVolume"
                :disabled="!device.online || !device.status"
                :max="100"
                @change="updateTvVolume"
              />
            </div>

            <div class="control-item">
              <div class="control-label">频道</div>
              <div class="channel-buttons">
                <el-button-group>
                  <el-button
                    :disabled="!device.online || !device.status"
                    @click="changeTvChannel(-1)"
                  >
                    上一个
                  </el-button>
                  <el-button type="primary">{{ tvChannel }}</el-button>
                  <el-button
                    :disabled="!device.online || !device.status"
                    @click="changeTvChannel(1)"
                  >
                    下一个
                  </el-button>
                </el-button-group>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">信号源</div>
              <el-select
                v-model="tvSource"
                :disabled="!device.online || !device.status"
                @change="updateTvSource"
              >
                <el-option label="HDMI 1" value="hdmi1" />
                <el-option label="HDMI 2" value="hdmi2" />
                <el-option label="HDMI 3" value="hdmi3" />
                <el-option label="TV" value="tv" />
              </el-select>
            </div>
          </div>

          <div v-else class="default-controls">
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch
                v-model="device.status"
                :disabled="!device.online"
                @change="updateDeviceStatus"
              />
            </div>
            <div class="no-controls-message" v-if="device.online">
              <el-alert
                title="简单控制"
                type="info"
                :closable="false"
                show-icon
              >
                此设备仅支持电源控制，无其他可配置项
              </el-alert>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑设备对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑设备信息" width="500px">
      <el-form
        :model="editForm"
        :rules="deviceRules"
        ref="deviceFormRef"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入设备名称" />
        </el-form-item>

        <el-form-item label="设备类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择设备类型">
            <el-option
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备ID" prop="id">
          <el-input disabled v-model="editForm.id" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateDevice" :loading="loading">
            保存
          </el-button>
          <el-button
            type="danger"
            @click="confirmDelete"
            :loading="deleteLoading"
          >
            删除设备
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Monitor,
  Refrigerator,
  Cpu,
  Cloudy,
  VideoCamera,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const deviceId = computed(() => route.params.deviceId);
const activeTab = ref("info");

// 设备类型定义
const deviceTypes = [
  { label: "灯光", value: "light" },
  { label: "电视", value: "tv" },
  { label: "空调", value: "ac" },
  { label: "冰箱", value: "fridge" },
  { label: "摄像头", value: "camera" },
  { label: "其他", value: "other" },
];

// 设备信息
const device = reactive({
  id: deviceId.value,
  name: "客厅灯",
  type: "light",
  online: true,
  status: true,
  ip: "192.168.1.100",
  mac: "AA:BB:CC:DD:EE:FF",
  firmware: "v1.2.3",
  addTime: new Date("2023-05-15"),
  lastActive: new Date(),
});

// 灯光控制
const lightBrightness = ref(80);
const lightTemperature = ref(50);
const lightColor = ref("#FFFFFF");

// 空调控制
const acTemperature = ref(24);
const acMode = ref("cool");
const acFanSpeed = ref("auto");

// 电视控制
const tvVolume = ref(30);
const tvChannel = ref(1);
const tvSource = ref("hdmi1");

// 编辑对话框
const editDialogVisible = ref(false);
const editFormRef = ref(null);
const editLoading = ref(false);
const editForm = reactive({
  name: "",
  type: "",
});

// 表单验证规则
const deviceRules = {
  name: [
    { required: true, message: "请输入设备名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择设备类型", trigger: "change" }],
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 根据设备类型获取图标
const getDeviceIcon = (type) => {
  const iconMap = {
    tv: Monitor,
    ac: Cloudy,
    fridge: Refrigerator,
    camera: VideoCamera,
    default: Cpu,
  };
  return iconMap[type] || iconMap.default;
};

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  const found = deviceTypes.find((item) => item.value === type);
  return found ? found.label : "其他";
};

// 切换设备状态
const toggleDevice = () => {
  device.status = !device.status;
  updateDeviceStatus();
};

// 更新设备状态
const updateDeviceStatus = () => {
  // 模拟API调用
  ElMessage.success(`${device.name}已${device.status ? "开启" : "关闭"}`);
};

// 灯光控制 - 更新亮度
const updateBrightness = (value) => {
  // 模拟API调用
  ElMessage.success(`${device.name}亮度已设置为${value}%`);
};

// 灯光控制 - 更新色温
const updateTemperature = (value) => {
  // 模拟API调用
  ElMessage.success(`${device.name}色温已设置为${value}%`);
};

// 灯光控制 - 更新颜色
const updateColor = (value) => {
  // 模拟API调用
  ElMessage.success(`${device.name}颜色已更新`);
};

// 空调控制 - 更新温度
const updateAcTemperature = (value) => {
  // 模拟API调用
  ElMessage.success(`空调温度已设置为${value}°C`);
};

// 空调控制 - 更新模式
const updateAcMode = (value) => {
  // 模拟API调用
  const modeMap = {
    cool: "制冷",
    heat: "制热",
    auto: "自动",
    dry: "除湿",
    fan: "送风",
  };
  ElMessage.success(`空调模式已切换为${modeMap[value]}`);
};

// 空调控制 - 更新风速
const updateAcFanSpeed = (value) => {
  // 模拟API调用
  const speedMap = {
    auto: "自动",
    low: "低速",
    medium: "中速",
    high: "高速",
  };
  ElMessage.success(`空调风速已设置为${speedMap[value]}`);
};

// 电视控制 - 更新音量
const updateTvVolume = (value) => {
  // 模拟API调用
  ElMessage.success(`电视音量已设置为${value}`);
};

// 电视控制 - 切换频道
const changeTvChannel = (step) => {
  tvChannel.value = Math.max(1, tvChannel.value + step);
  // 模拟API调用
  ElMessage.success(`已切换到频道${tvChannel.value}`);
};

// 电视控制 - 切换信号源
const updateTvSource = (value) => {
  // 模拟API调用
  const sourceMap = {
    hdmi1: "HDMI 1",
    hdmi2: "HDMI 2",
    hdmi3: "HDMI 3",
    tv: "TV",
  };
  ElMessage.success(`已切换到信号源${sourceMap[value]}`);
};

// 摄像头控制
const controlCamera = (action) => {
  // 模拟API调用
  const actionMap = {
    up: "上",
    down: "下",
    left: "左",
    right: "右",
    zoomIn: "放大",
    zoomOut: "缩小",
  };
  ElMessage.success(`摄像头${actionMap[action]}`);
};

// 显示编辑对话框
const showEditDialog = () => {
  editForm.name = device.name;
  editForm.type = device.type;
  editDialogVisible.value = true;
};

// 更新设备信息
const updateDeviceInfo = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();

    editLoading.value = true;

    // 模拟API调用
    setTimeout(() => {
      // 更新设备信息
      device.name = editForm.name;
      device.type = editForm.type;

      ElMessage.success("设备信息更新成功");
      editDialogVisible.value = false;
      editLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error("表单验证失败", error);
    editLoading.value = false;
  }
};

// 页面加载时获取设备信息
onMounted(() => {
  // 这里应该获取设备的详细信息
  // 模拟API调用
  // 实际上会根据deviceId来获取对应设备的信息
});
</script>

<style scoped>
.device-detail {
  padding-bottom: 40px;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  margin-right: 15px;
}

.device-title {
  flex: 1;
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.device-status {
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.status-online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-offline {
  background-color: #fef0f0;
  color: #f56c6c;
}

.device-tabs {
  margin-bottom: 30px;
}

.device-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.device-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 50%;
  margin-right: 30px;
}

.info-actions {
  flex: 1;
}

.device-descriptions {
  margin-top: 20px;
}

.control-card {
  min-height: 300px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.control-item {
  margin-bottom: 25px;
}

.control-label {
  font-weight: 500;
  margin-bottom: 10px;
  color: #606266;
}

.camera-preview {
  position: relative;
  margin-top: 20px;
}

.preview-img {
  width: 100%;
  border-radius: 8px;
  display: block;
}

.camera-controls-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.camera-offline {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  color: #909399;
  margin-top: 20px;
}

.no-specific-controls {
  margin-top: 20px;
  padding: 40px 0;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  color: #909399;
}

@media (max-width: 768px) {
  .device-info-header {
    flex-direction: column;
    gap: 20px;
  }

  .info-actions {
    width: 100%;
  }

  .device-icon {
    margin-right: 0;
  }
}
</style>
