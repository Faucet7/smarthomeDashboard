<template>
  <div class="device-list">
    <!-- 搜索和过滤 -->
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索设备"
        class="search-input"
        clearable
        prefix-icon="Search"
      />

      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        class="status-filter"
      >
        <el-option label="全部" value="" />
        <el-option label="在线" value="online" />
        <el-option label="离线" value="offline" />
      </el-select>

      <el-select
        v-model="typeFilter"
        placeholder="类型筛选"
        class="type-filter"
      >
        <el-option label="全部" value="" />
        <el-option
          v-for="type in deviceTypes"
          :key="type.id"
          :label="type.name"
          :value="type.id"
        />
      </el-select>
    </div>

    <!-- 添加设备按钮 -->
    <div class="action-section">
      <el-button type="primary" @click="showAddDeviceDialog">
        <el-icon><Plus /></el-icon>添加设备
      </el-button>
    </div>

    <!-- 设备列表 -->
    <el-row :gutter="20">
      <el-col
        v-for="device in filteredDevices"
        :key="device.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
      >
        <el-card
          class="device-card"
          shadow="hover"
          :class="{ 'device-offline': !device.online }"
          @click="goToDeviceDetail(device.id)"
        >
          <div class="device-icon">
            <el-icon size="32px"
              ><component :is="getDeviceIcon(device.type)"
            /></el-icon>
          </div>
          <div class="device-info">
            <h3>{{ device.name }}</h3>
            <p class="device-id">ID: {{ device.id }}</p>
            <p class="device-type">
              类型: {{ getDeviceTypeName(device.type) }}
            </p>
            <div
              class="device-status"
              :class="device.online ? 'status-online' : 'status-offline'"
            >
              {{ device.online ? "在线" : "离线" }}
            </div>
          </div>
          <div class="device-actions">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                :disabled="!device.online"
                @click.stop="toggleDevice(device)"
              >
                {{ device.status ? "关闭" : "开启" }}
              </el-button>
              <el-button
                size="small"
                @click.stop="$router.push(`/devices/${device.id}/logs`)"
              >
                日志
              </el-button>
            </el-button-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 没有设备时显示 -->
    <el-empty v-if="filteredDevices.length === 0" description="没有找到设备" />

    <!-- 添加设备对话框 -->
    <el-dialog v-model="addDeviceDialogVisible" title="添加设备" width="500px">
      <el-form
        :model="newDeviceForm"
        :rules="deviceRules"
        ref="deviceFormRef"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="newDeviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>

        <el-form-item label="设备类型" prop="type">
          <el-select v-model="newDeviceForm.type" placeholder="请选择设备类型">
            <el-option
              v-for="type in deviceTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备ID" prop="deviceId">
          <el-input
            v-model="newDeviceForm.deviceId"
            placeholder="请输入设备ID"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addDevice" :loading="addLoading">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Search,
  Plus,
  Monitor,
  Refrigerator,
  Cpu,
  Cloudy,
  VideoCamera,
  Lightning,
  SetUp,
} from "@element-plus/icons-vue";
import {
  getDeviceList,
  getDeviceTypes,
  toggleDevice as toggleDeviceApi,
} from "@/api/device";

const router = useRouter();

// 设备列表
const devices = ref([]);

// 搜索和过滤
const searchQuery = ref("");
const statusFilter = ref("");
const typeFilter = ref("");

// 设备类型
const deviceTypes = ref([]);

// 添加设备对话框
const addDeviceDialogVisible = ref(false);
const deviceFormRef = ref(null);
const addLoading = ref(false);
const newDeviceForm = reactive({
  name: "",
  type: "",
  deviceId: "",
});

// 表单验证规则
const deviceRules = {
  name: [
    { required: true, message: "请输入设备名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择设备类型", trigger: "change" }],
  deviceId: [{ required: true, message: "请输入设备ID", trigger: "blur" }],
};

// 过滤后的设备列表
const filteredDevices = computed(() => {
  return devices.value.filter((device) => {
    // 搜索过滤
    const nameMatch = device.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    // 状态过滤
    const statusMatch =
      statusFilter.value === ""
        ? true
        : statusFilter.value === "online"
        ? device.online
        : !device.online;

    // 类型过滤
    const typeMatch =
      typeFilter.value === "" ? true : device.type === typeFilter.value;

    return nameMatch && statusMatch && typeMatch;
  });
});

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

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  const found = deviceTypes.value.find((item) => item.id === type);
  return found ? found.name : "其他";
};

// 切换设备状态
const toggleDevice = async (device) => {
  try {
    const res = await toggleDeviceApi(device.id);
    if (res.status === 200) {
      ElMessage.success(
        res.message ||
          `${device.name}已${res.result.device.status ? "开启" : "关闭"}`
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

// 跳转到设备详情
const goToDeviceDetail = (deviceId) => {
  router.push(`/devices/${deviceId}`);
};

// 显示添加设备对话框
const showAddDeviceDialog = () => {
  addDeviceDialogVisible.value = true;
  if (deviceFormRef.value) {
    deviceFormRef.value.resetFields();
  }
};

// 添加设备
const addDevice = async () => {
  if (!deviceFormRef.value) return;

  try {
    await deviceFormRef.value.validate();

    addLoading.value = true;

    // 模拟API调用
    setTimeout(() => {
      // 创建新设备对象
      const newDevice = {
        id: newDeviceForm.deviceId,
        name: newDeviceForm.name,
        type: newDeviceForm.type,
        online: true,
        status: false,
      };

      // 添加到列表
      devices.value.push(newDevice);

      ElMessage.success("设备添加成功");
      addDeviceDialogVisible.value = false;
      addLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error("表单验证失败", error);
    addLoading.value = false;
  }
};

// 加载设备类型列表
const loadDeviceTypes = async () => {
  try {
    const res = await getDeviceTypes();
    if (res.status === 200 && res.result.types) {
      deviceTypes.value = res.result.types;
    }
  } catch (error) {
    console.error("加载设备类型失败:", error);
  }
};

// 加载设备列表
const loadDevices = async () => {
  try {
    const res = await getDeviceList();
    if (res.status === 200 && res.result.devices) {
      devices.value = res.result.devices;
    }
  } catch (error) {
    console.error("加载设备列表失败:", error);
  }
};

onMounted(() => {
  // 加载设备类型和设备列表
  loadDeviceTypes();
  loadDevices();
});
</script>

<style scoped>
.device-list {
  padding-bottom: 40px;
  width: 100%;
}

.filter-section {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  max-width: 250px;
}

.status-filter,
.type-filter {
  width: 150px;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.device-card {
  margin-bottom: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.device-offline {
  opacity: 0.6;
}

.device-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  color: #409eff;
}

.device-info {
  text-align: center;
}

.device-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #303133;
}

.device-id,
.device-type {
  margin: 5px 0;
  font-size: 14px;
  color: #909399;
}

.device-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  margin: 10px 0;
}

.status-online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-offline {
  background-color: #fef0f0;
  color: #f56c6c;
}

.device-actions {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .search-input,
  .status-filter,
  .type-filter {
    width: 100%;
    max-width: none;
  }
}
</style>
