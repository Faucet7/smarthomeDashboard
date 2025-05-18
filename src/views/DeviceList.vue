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
        <el-option label="在线" value="1" />
        <el-option label="离线" value="0" />
      </el-select>

      <el-select
        v-model="typeFilter"
        placeholder="类型筛选"
        class="type-filter"
      >
        <el-option label="全部" value="" />
        <el-option label="直连设备" value="device" />
        <el-option label="网关设备" value="gateway" />
        <el-option label="网关子设备" value="childrenDevice" />
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
          :class="{ 'device-offline': device.state.value === 'offline' }"
          @click="goToDeviceDetail(device.id)"
        >
          <div class="device-icon">
            <img
              v-if="device.photoUrl"
              :src="device.photoUrl"
              class="device-photo"
            />
            <el-icon v-else size="32px"
              ><component :is="getDeviceIcon(device.deviceType.value)"
            /></el-icon>
          </div>
          <div class="device-info">
            <h3>{{ device.name }}</h3>
            <p class="device-id">ID: {{ device.id }}</p>
            <p class="device-type">类型: {{ device.deviceType.text }}</p>
            <p v-if="device.classifiedName" class="device-classified">
              分类: {{ device.classifiedName }}
            </p>
            <div
              class="device-status"
              :class="
                device.state.value === 'online'
                  ? 'status-online'
                  : 'status-offline'
              "
            >
              {{ device.state.text }}
            </div>
          </div>
          <div class="device-actions">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click.stop="editDevice(device)"
                :disabled="device.state.value === 'offline'"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="info"
                @click.stop="exportDevice(device)"
              >
                导出
              </el-button>
              <el-button
                size="small"
                :type="device.state.value === 'online' ? 'warning' : 'success'"
                :disabled="false"
                @click.stop="toggleDeviceState(device)"
              >
                {{ device.state.value === "online" ? "禁用" : "启用" }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click.stop="deleteDevice(device)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 没有设备时显示 -->
    <el-empty v-if="filteredDevices.length === 0" description="没有找到设备" />

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

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

        <el-form-item label="设备类型" prop="deviceType">
          <el-select
            v-model="newDeviceForm.deviceType"
            placeholder="请选择设备类型"
          >
            <el-option label="直连设备" value="device" />
            <el-option label="网关设备" value="gateway" />
            <el-option label="网关子设备" value="childrenDevice" />
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
import { ElMessage, ElMessageBox } from "element-plus";
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
  toggleDevice as toggleDeviceApi,
  deployDevice,
  undeployDevice,
} from "@/api/device";

const router = useRouter();

// 设备列表
const devices = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);

// 搜索和过滤
const searchQuery = ref("");
const statusFilter = ref("");
const typeFilter = ref("");

// 添加设备对话框
const addDeviceDialogVisible = ref(false);
const deviceFormRef = ref(null);
const addLoading = ref(false);
const newDeviceForm = reactive({
  name: "",
  deviceType: "",
  deviceId: "",
});

// 表单验证规则
const deviceRules = {
  name: [
    { required: true, message: "请输入设备名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  deviceType: [
    { required: true, message: "请选择设备类型", trigger: "change" },
  ],
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
        : statusFilter.value === "1"
        ? device.state.value === "online"
        : device.state.value === "offline";

    // 类型过滤
    const typeMatch =
      typeFilter.value === ""
        ? true
        : device.deviceType.value === typeFilter.value;

    return nameMatch && statusMatch && typeMatch;
  });
});

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

// 切换设备状态（启用/禁用）
const toggleDeviceState = async (device) => {
  console.log(device);
  //如果设备离线，则不可启用
  if (device.state.value === "offline") {
    ElMessage.error("设备离线，无法启用");
    return;
  }
  try {
    const productId = device.id;
    let res;

    if (device.state.value === "notActive") {
      // 如果当前是禁用状态，调用部署接口启用设备
      res = await deployDevice(productId);
    } else {
      // 如果当前是启用状态，调用取消部署接口禁用设备
      res = await undeployDevice(productId);
    }

    if (res.status === 200) {
      ElMessage.success(
        `${device.state.value === "online" ? "禁用" : "启用"}成功`
      );
      // 重新加载设备列表以获取最新状态
      loadDevices();
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    // console.error("操作设备失败:", error);
  }
};

// 编辑设备
const editDevice = (device) => {
  // 编辑设备逻辑，暂时只是导航到详情页
  router.push(`/devices/${device.id}/edit`);
};

// 导出设备
const exportDevice = (device) => {
  // 导出设备逻辑，暂时实现为消息提示
  ElMessage.info(`导出设备：${device.name} 功能待实现`);
};

// 删除设备
const deleteDevice = (device) => {
  // 删除设备逻辑，暂时实现为确认对话框
  ElMessageBox.confirm(
    `确定要删除设备 "${device.name}" 吗？此操作不可恢复！`,
    "删除确认",
    {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      ElMessage({
        type: "success",
        message: `删除设备：${device.name} 功能待实现`,
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消删除",
      });
    });
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
      ElMessage.success("设备添加成功");
      addDeviceDialogVisible.value = false;
      addLoading.value = false;

      // 重新加载设备列表
      loadDevices();
    }, 1000);
  } catch (error) {
    console.error("表单验证失败", error);
    addLoading.value = false;
  }
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  loadDevices();
};

// 处理页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  loadDevices();
};

// 加载设备列表
const loadDevices = async () => {
  try {
    const res = await getDeviceList({
      pageIndex: currentPage.value - 1,
      pageSize: pageSize.value,
    });

    if (res.status === 200 && res.result) {
      devices.value = res.result.data;
      total.value = res.result.total;
    }
  } catch (error) {
    console.error("加载设备列表失败:", error);
    ElMessage.error("加载设备列表失败，请稍后重试");
  }
};

onMounted(() => {
  // 加载设备列表
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
  position: relative;
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

.device-photo {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
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
.device-type,
.device-classified {
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
.device-actions .el-button-group {
  display: flex;
  position: absolute;
  bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
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
