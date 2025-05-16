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
        :class="
          device.state.value === 'online' ? 'status-online' : 'status-offline'
        "
      >
        {{ device.state.text }}
      </div>
    </div>

    <el-tabs v-model="activeTab" class="device-tabs">
      <el-tab-pane label="设备信息" name="info">
        <el-card class="info-card">
          <div class="device-info-header">
            <div class="device-icon">
              <img
                v-if="device.photoUrl"
                :src="device.photoUrl"
                class="device-photo"
              />
              <el-icon v-else size="60px"
                ><component :is="getDeviceIcon(device.deviceType?.value)"
              /></el-icon>
            </div>
            <div class="info-actions">
              <el-button-group>
                <el-button
                  type="primary"
                  :disabled="device.state.value === 'offline'"
                  @click="toggleDevice"
                >
                  {{
                    device.state.value === "online" ? "控制设备" : "设备离线"
                  }}
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
              device.deviceType?.text || "未知"
            }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <el-tag
                :type="device.state.value === 'online' ? 'success' : 'info'"
              >
                {{ device.state.text }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="产品ID" v-if="device.productId">
              {{ device.productId }}
            </el-descriptions-item>
            <el-descriptions-item label="产品名称" v-if="device.productName">
              {{ device.productName }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" v-if="device.describe">
              {{ device.describe }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者" v-if="device.creatorName">
              {{ device.creatorName }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(device.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间" v-if="device.registryTime">
              {{ formatDate(device.registryTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="修改者" v-if="device.modifierName">
              {{ device.modifierName }}
            </el-descriptions-item>
            <el-descriptions-item label="修改时间">
              {{ formatDate(device.modifyTime) }}
            </el-descriptions-item>
          </el-descriptions>

          <el-descriptions
            v-if="device.configuration"
            title="配置信息"
            :column="2"
            border
            class="device-descriptions"
          >
            <el-descriptions-item
              v-for="(value, key) in device.configuration"
              :key="key"
              :label="formatConfigLabel(key)"
            >
              {{ value }}
            </el-descriptions-item>
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

          <div
            v-if="device.state.value === 'offline'"
            class="device-offline-control"
          >
            <el-empty description="设备当前离线，无法控制" />
          </div>

          <div
            v-else-if="device.deviceType?.value === 'childrenDevice'"
            class="light-controls"
          >
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch v-model="devicePower" @change="updateDeviceStatus" />
            </div>

            <div class="control-item">
              <div class="control-label">亮度</div>
              <el-slider
                v-model="lightBrightness"
                :disabled="!devicePower"
                @change="updateBrightness"
              />
            </div>

            <div class="control-item">
              <div class="control-label">色温</div>
              <el-slider
                v-model="lightTemperature"
                :disabled="!devicePower"
                @change="updateTemperature"
              />
            </div>
          </div>

          <div
            v-else-if="device.deviceType?.value === 'gateway'"
            class="gateway-controls"
          >
            <div class="control-item">
              <div class="control-label">网关状态</div>
              <el-tag type="success">已连接</el-tag>
            </div>

            <div class="control-item">
              <div class="control-label">子设备数量</div>
              <el-badge
                :value="childDevicesCount"
                class="child-devices-count"
              />
            </div>

            <div class="control-item">
              <div class="control-label">操作</div>
              <el-button-group>
                <el-button @click="refreshGateway">刷新</el-button>
                <el-button type="primary" @click="scanDevices"
                  >扫描设备</el-button
                >
                <el-button type="warning" @click="restartGateway"
                  >重启网关</el-button
                >
              </el-button-group>
            </div>
          </div>

          <div v-else class="device-controls">
            <div class="control-item">
              <div class="control-label">电源</div>
              <el-switch v-model="devicePower" @change="updateDeviceStatus" />
            </div>

            <template v-if="device.metadata">
              <div class="metadata-controls">
                <h3 class="metadata-title">设备属性</h3>
                <div class="metadata-properties">
                  <div
                    v-if="parsedMetadata && parsedMetadata.properties"
                    class="property-list"
                  >
                    <div
                      v-for="prop in parsedMetadata.properties"
                      :key="prop.id"
                      class="property-item"
                    >
                      <span class="property-name">{{ prop.name }}</span>
                      <div class="property-control">
                        <el-input
                          v-if="isNumberType(prop)"
                          v-model="propertyValues[prop.id]"
                          type="number"
                        />
                        <el-select
                          v-else-if="isEnumType(prop)"
                          v-model="propertyValues[prop.id]"
                        >
                          <el-option
                            v-for="option in prop.valueType.elements"
                            :key="option.value"
                            :label="option.text"
                            :value="option.value"
                          />
                        </el-select>
                        <el-input v-else v-model="propertyValues[prop.id]" />
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-properties">
                    <el-alert
                      title="无可控制的属性"
                      type="info"
                      :closable="false"
                    />
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="no-controls-message">
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

        <el-form-item label="设备类型" prop="deviceType">
          <el-select
            v-model="editForm.deviceType"
            placeholder="请选择设备类型"
            disabled
          >
            <el-option label="直连设备" value="device" />
            <el-option label="网关设备" value="gateway" />
            <el-option label="网关子设备" value="childrenDevice" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备ID" prop="id">
          <el-input disabled v-model="editForm.id" />
        </el-form-item>

        <el-form-item
          label="分类名称"
          prop="classifiedName"
          v-if="editForm.classifiedName !== undefined"
        >
          <el-input
            v-model="editForm.classifiedName"
            placeholder="请输入分类名称"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="updateDevice"
            :loading="editLoading"
          >
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
  Lightning,
  SetUp,
} from "@element-plus/icons-vue";
import {
  getDeviceDetail,
  toggleDevice as toggleDeviceApi,
  updateDeviceProperty,
} from "@/api/device";

const router = useRouter();
const route = useRoute();
const deviceId = computed(() => route.params.deviceId);
const activeTab = ref("info");

// 设备电源状态
const devicePower = computed(() => {
  return device.state.value === "online";
});

// 子设备数量（网关设备）
const childDevicesCount = ref(0);

// 设备属性值
const propertyValues = reactive({});

// 设备信息
const device = reactive({
  id: deviceId.value,
  name: "",
  deviceType: {
    text: "",
    value: "",
  },
  state: {
    text: "离线",
    value: "offline",
  },
  photoUrl: "",
  productId: "",
  productName: "",
  describe: "",
  deriveMetadata: "",
  creatorId: "",
  creatorName: "",
  createTime: null,
  registryTime: null,
  modifierId: "",
  modifierName: "",
  modifyTime: null,
  features: [],
});

// 解析的元数据
const parsedMetadata = computed(() => {
  if (!device.deriveMetadata) return null;
  try {
    return JSON.parse(device.deriveMetadata);
  } catch (e) {
    console.error("解析元数据失败:", e);
    return null;
  }
});

// 灯光控制
const lightBrightness = ref(80);
const lightTemperature = ref(50);

// 编辑对话框
const editDialogVisible = ref(false);
const deviceFormRef = ref(null);
const editLoading = ref(false);
const deleteLoading = ref(false);
const editForm = reactive({
  name: "",
  deviceType: "",
  id: "",
  classifiedName: "",
});

// 表单验证规则
const deviceRules = {
  name: [
    { required: true, message: "请输入设备名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
};

// 判断属性类型
const isNumberType = (prop) => {
  if (!prop.valueType) return false;
  return ["int", "float", "double"].includes(prop.valueType.type);
};

const isEnumType = (prop) => {
  if (!prop.valueType) return false;
  return (
    prop.valueType.type === "enum" && Array.isArray(prop.valueType.elements)
  );
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";

  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 格式化配置标签
const formatConfigLabel = (key) => {
  const labelMap = {
    username: "用户名",
    password: "密码",
    secureId: "安全ID",
    secureKey: "安全密钥",
  };

  return labelMap[key] || key;
};

// 根据设备类型获取图标
const getDeviceIcon = (type) => {
  const iconMap = {
    device: Lightning,
    gateway: Monitor,
    childrenDevice: Cpu,
    default: SetUp,
  };
  return iconMap[type] || iconMap.default;
};

// 切换设备状态
const toggleDevice = async () => {
  try {
    const res = await toggleDeviceApi(device.id);
    if (res.status === 200) {
      ElMessage.success(res.message || "操作成功");
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("操作设备失败:", error);
    ElMessage.error("操作失败，请稍后再试");
  }
};

// 更新设备状态
const updateDeviceStatus = async () => {
  try {
    const res = await updateDeviceProperty(
      device.id,
      "power",
      devicePower.value
    );
    if (res.status === 200) {
      ElMessage.success(
        `电源状态已更新为${devicePower.value ? "开启" : "关闭"}`
      );
    } else {
      // 如果失败，恢复原状态
      devicePower.value = !devicePower.value;
      ElMessage.error(res.message || "更新失败");
    }
  } catch (error) {
    // 如果出错，恢复原状态
    devicePower.value = !devicePower.value;
    console.error("更新设备属性失败:", error);
    ElMessage.error("操作失败，请稍后再试");
  }
};

// 灯光控制 - 更新亮度
const updateBrightness = async (value) => {
  try {
    const res = await updateDeviceProperty(device.id, "brightness", value);
    if (res.status === 200) {
      ElMessage.success(`${device.name}亮度已设置为${value}%`);
    } else {
      ElMessage.error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("更新设备属性失败:", error);
    ElMessage.error("操作失败，请稍后再试");
  }
};

// 灯光控制 - 更新色温
const updateTemperature = async (value) => {
  try {
    const res = await updateDeviceProperty(
      device.id,
      "colorTemperature",
      value
    );
    if (res.status === 200) {
      ElMessage.success(`${device.name}色温已设置为${value}%`);
    } else {
      ElMessage.error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("更新设备属性失败:", error);
    ElMessage.error("操作失败，请稍后再试");
  }
};

// 网关设备操作
const refreshGateway = () => {
  ElMessage.info("刷新网关");
};

const scanDevices = () => {
  ElMessage.info("扫描设备");
};

const restartGateway = () => {
  ElMessageBox.confirm(
    "确定要重启网关设备吗？重启过程中所有连接设备将临时离线。",
    "重启确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      ElMessage.success("网关重启指令已发送");
    })
    .catch(() => {
      ElMessage.info("已取消重启");
    });
};

// 显示编辑对话框
const showEditDialog = () => {
  editForm.name = device.name;
  editForm.deviceType = device.deviceType?.value || "";
  editForm.id = device.id;
  editForm.classifiedName = device.classifiedName;
  editDialogVisible.value = true;
};

// 更新设备信息
const updateDevice = async () => {
  if (!deviceFormRef.value) return;

  try {
    await deviceFormRef.value.validate();

    editLoading.value = true;

    // 模拟API调用
    setTimeout(() => {
      // 更新设备信息
      device.name = editForm.name;
      device.classifiedName = editForm.classifiedName;

      ElMessage.success("设备信息更新成功");
      editDialogVisible.value = false;
      editLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error("表单验证失败", error);
    editLoading.value = false;
  }
};

// 确认删除
const confirmDelete = () => {
  ElMessageBox.confirm(
    `确定要删除设备 "${device.name}" 吗？此操作不可恢复！`,
    "删除确认",
    {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "danger",
    }
  )
    .then(() => {
      deleteLoading.value = true;
      // 模拟删除操作
      setTimeout(() => {
        ElMessage.success("设备已删除");
        deleteLoading.value = false;
        router.push("/devices");
      }, 1000);
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 加载设备详情
const loadDeviceDetail = async () => {
  try {
    const res = await getDeviceDetail(deviceId.value);
    if (res.status === 200 && res.result) {
      const deviceData = res.result;
      Object.assign(device, deviceData);

      // 设置电源状态
      devicePower.value = device.state.value === "online";

      // 如果是网关设备，设置子设备计数
      if (device.deviceType?.value === "gateway") {
        // 假设有API可以获取子设备数量
        childDevicesCount.value = 3; // 示例值
      }

      // 如果有元数据，解析属性值
      if (parsedMetadata.value && parsedMetadata.value.properties) {
        parsedMetadata.value.properties.forEach((prop) => {
          // 设置默认属性值
          if (
            prop.valueType &&
            prop.valueType.type === "enum" &&
            prop.valueType.elements?.length > 0
          ) {
            propertyValues[prop.id] = prop.valueType.elements[0].value;
          } else if (
            ["int", "float", "double"].includes(prop.valueType?.type)
          ) {
            propertyValues[prop.id] = 0;
          } else if (prop.valueType?.type === "boolean") {
            propertyValues[prop.id] = prop.valueType.falseValue || false;
          } else {
            propertyValues[prop.id] = "";
          }
        });
      }
    }
  } catch (error) {
    console.error("加载设备详情失败:", error);
    ElMessage.error("加载设备详情失败，请稍后再试");
  }
};

// 页面加载时获取设备信息
onMounted(() => {
  loadDeviceDetail();
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
  overflow: hidden;
}

.device-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.device-offline-control {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.metadata-controls {
  margin-top: 20px;
}

.metadata-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #606266;
}

.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-name {
  font-weight: 500;
  color: #606266;
}

.no-properties,
.no-controls-message {
  margin-top: 20px;
}

.child-devices-count {
  font-size: 16px;
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

  .property-list {
    grid-template-columns: 1fr;
  }
}
</style>
