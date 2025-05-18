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

      <el-tab-pane
        label="控制面板"
        name="control"
        @click="getDeviceControlItems()"
      >
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

          <div v-else class="property-cards">
            <el-row :gutter="20">
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
                v-for="(item, index) in deviceProperties"
                :key="index"
              >
                <el-card class="property-card" shadow="hover">
                  <template #header>
                    <div class="property-card-header">
                      <span>{{ item.propertyName }}</span>
                      <el-button
                        v-if="
                          item.type === 'enum' ||
                          item.type === 'int' ||
                          item.type === 'float'
                        "
                        type="primary"
                        link
                        @click="showPropertyEditDialog(item)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  <div class="property-card-content">
                    <div v-if="item.type === 'enum'" class="property-value">
                      <el-tag
                        :type="getPropertyTagType(item.property, item.value)"
                      >
                        {{ item.formatValue }}
                      </el-tag>
                    </div>
                    <div
                      v-else-if="item.type === 'float' || item.type === 'int'"
                      class="property-value"
                    >
                      <span class="number-value">{{ item.numberValue }}</span>
                      <span class="unit">{{ item.unit }}</span>
                    </div>
                    <div v-else class="property-value">
                      {{ item.formatValue }}
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
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

    <!-- 编辑属性对话框 -->
    <el-dialog
      v-model="editPropertyDialogVisible"
      :title="`编辑${currentProperty?.propertyName || ''}`"
      width="400px"
    >
      <el-form :model="editPropertyForm" label-width="80px">
        <el-form-item :label="currentProperty?.propertyName || '值'">
          <el-select
            v-if="currentProperty?.type === 'enum'"
            v-model="editPropertyForm.value"
            placeholder="请选择"
          >
            <el-option
              v-for="option in getEnumOptions(currentProperty)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input-number
            v-else-if="currentProperty?.type === 'int'"
            v-model="editPropertyForm.value"
            :min="0"
            :max="100"
          />
          <el-input-number
            v-else-if="currentProperty?.type === 'float'"
            v-model="editPropertyForm.value"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="100"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editPropertyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handlePropertyUpdate"
            :loading="updating"
          >
            确定
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
  Edit,
} from "@element-plus/icons-vue";
import {
  getDeviceDetail,
  toggleDevice as toggleDeviceApi,
  updateDevicePropertyApi,
  getDeviceProperties,
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

// 设备属性数据
const deviceProperties = ref([]);

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
  properties: [],
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

// 更新设备属性
const updateDeviceProperty = async (property, value) => {
  const res = await updateDevicePropertyApi(deviceId.value, {
    property: property,
    value: value,
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
        childDevicesCount.value = 3; // 示例值
      }

      // 解析metadata中的属性
      if (deviceData.metadata) {
        try {
          const metadata = JSON.parse(deviceData.metadata);
          if (metadata.properties) {
            // 将properties保存到device对象中
            device.properties = metadata.properties;

            // 初始化每个属性的默认值
            metadata.properties.forEach((prop) => {
              if (prop.valueType) {
                switch (prop.valueType.type) {
                  case "enum":
                    // 对于枚举类型，使用第一个选项作为默认值
                    if (prop.valueType.elements?.length > 0) {
                      propertyValues[prop.id] =
                        prop.valueType.elements[0].value;
                    }
                    break;
                  case "int":
                  case "float":
                  case "double":
                    // 对于数值类型，初始化为0
                    propertyValues[prop.id] = 0;
                    break;
                  case "boolean":
                    // 对于布尔类型，初始化为false
                    propertyValues[prop.id] = false;
                    break;
                  default:
                    // 其他类型初始化为空字符串
                    propertyValues[prop.id] = "";
                }
              }
            });
          }
        } catch (e) {
          console.error("解析metadata失败:", e);
        }
      }
    }
  } catch (error) {
    console.error("加载设备详情失败:", error);
    ElMessage.error("加载设备详情失败，请稍后再试");
  }
};

// 获取属性标签类型
const getPropertyTagType = (property, value) => {
  // 根据属性和值返回不同的标签类型
  if (property === "power_on") {
    return value === "true" ? "success" : "info";
  }
  if (property === "system_mode") {
    return value === "off" ? "info" : "success";
  }
  if (property === "child_lock") {
    return value === "LOCK" ? "danger" : "success";
  }
  if (property === "fan_mode") {
    return "warning";
  }
  return "";
};

// 获取设备控制项目
const getDeviceControlItems = async () => {
  try {
    // 获取设备属性ID列表
    const properties = device.properties.map((item) => item.id);

    const res = await getDeviceProperties(deviceId.value, properties);
    if (res.status === 200 && res.result) {
      // 更新设备属性数据
      deviceProperties.value = res.result.data || [];
    }
  } catch (error) {
    console.error("获取设备属性失败:", error);
    ElMessage.error("获取设备属性失败，请稍后再试");
  }
};

// 编辑属性相关
const editPropertyDialogVisible = ref(false);
const currentProperty = ref(null);
const editPropertyForm = reactive({
  value: null,
});
const updating = ref(false);

// 显示编辑对话框
const showPropertyEditDialog = (property) => {
  currentProperty.value = property;
  editPropertyForm.value = property.value;
  editPropertyDialogVisible.value = true;
};

// 获取枚举类型的选项
const getEnumOptions = (property) => {
  if (!property) return [];

  // 根据属性类型返回不同的选项
  switch (property.property) {
    case "power_on":
      return [
        { value: "true", label: "开" },
        { value: "false", label: "关" },
      ];
    case "fan_mode":
      return [
        { value: "low", label: "低" },
        { value: "medium", label: "中" },
        { value: "high", label: "高" },
      ];
    case "system_mode":
      return [
        { value: "off", label: "关闭" },
        { value: "heat", label: "制热" },
        { value: "cool", label: "制冷" },
      ];
    case "child_lock":
      return [
        { value: "LOCK", label: "锁定" },
        { value: "UNLOCK", label: "解锁" },
      ];
    default:
      return [];
  }
};

// 处理属性更新
const handlePropertyUpdate = async () => {
  if (!currentProperty.value) return;

  try {
    updating.value = true;
    await updateDeviceProperty(
      currentProperty.value.property,
      editPropertyForm.value
    );

    // 更新成功后刷新属性列表
    await getDeviceControlItems();
    ElMessage.success("属性更新成功");
    editPropertyDialogVisible.value = false;
  } catch (error) {
    console.error("更新属性失败:", error);
    ElMessage.error("更新属性失败，请稍后再试");
  } finally {
    updating.value = false;
  }
};

// 页面加载时获取设备信息
onMounted(async () => {
  await loadDeviceDetail();
  await getDeviceControlItems();
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

.property-cards {
  margin-top: 20px;
}

.property-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.property-card:hover {
  transform: translateY(-5px);
}

.property-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #606266;
}

.property-card-header .el-button {
  padding: 2px;
}

.property-card-header .el-icon {
  font-size: 16px;
}

.property-card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
}

.property-value {
  text-align: center;
}

.number-value {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
}

.unit {
  margin-left: 4px;
  color: #909399;
  font-size: 14px;
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

  .property-cards {
    margin-top: 10px;
  }

  .property-card {
    margin-bottom: 10px;
  }
}
</style>
