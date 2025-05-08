<template>
  <div class="home-info">
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="home-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon class="header-icon"><House /></el-icon>家庭信息</span
              >
            </div>
          </template>

          <el-form
            :model="homeForm"
            :rules="rules"
            ref="homeFormRef"
            label-width="100px"
            class="home-form"
            :disabled="!isEditing"
          >
            <el-form-item label="家庭名称" prop="name">
              <el-input v-model="homeForm.name" placeholder="请输入家庭名称" />
            </el-form-item>

            <el-form-item label="家庭ID">
              <el-input v-model="homeForm.id" disabled />
            </el-form-item>

            <el-form-item v-if="isEditing">
              <el-button type="primary" @click="saveChanges" :loading="loading"
                >保存</el-button
              >
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>

          <div class="action-buttons" v-if="!isEditing">
            <el-button type="primary" @click="startEdit">
              <el-icon><Edit /></el-icon>编辑信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="home-stats" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon class="header-icon"><DataAnalysis /></el-icon
                >家庭统计</span
              >
            </div>
          </template>

          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-icon user-icon">
                <el-icon size="30"><User /></el-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ membersCount }}</div>
                <div class="stat-label">用户数量</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon device-icon">
                <el-icon size="30"><Monitor /></el-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ deviceStats.total }}</div>
                <div class="stat-label">设备数量</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon date-icon">
                <el-icon size="30"><Clock /></el-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">
                  {{ formatDate(homeForm.createdAt) }}
                </div>
                <div class="stat-label">创建日期</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 家庭成员列表 -->
    <el-card class="members-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span
            ><el-icon class="header-icon"><UserFilled /></el-icon>家庭成员</span
          >
        </div>
      </template>

      <el-table
        :data="members"
        stripe
        style="width: 100%"
        v-loading="membersLoading"
      >
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column label="角色">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.type.id === 1
                  ? 'danger'
                  : scope.row.type.id === 3
                  ? 'info'
                  : 'success'
              "
            >
              {{ scope.row.type.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  User,
  Monitor,
  Clock,
  House,
  Edit,
  DataAnalysis,
  UserFilled,
} from "@element-plus/icons-vue";
import { getUserInfo } from "@/utils/auth";
import { getHomeInfo, getHomeMembers, updateHomeInfo } from "@/api/home";
import { getDeviceStats } from "@/api/device";

// 家庭信息表单
const homeFormRef = ref(null);
const homeForm = reactive({
  id: "",
  name: "",
  createdAt: "",
  updatedAt: "",
});

// 设备统计
const deviceStats = reactive({
  total: 0,
  online: 0,
  offline: 0,
});

// 家庭成员
const members = ref([]);
const membersCount = ref(0);
const membersLoading = ref(false);

// 编辑状态管理
const isEditing = ref(false);
const loading = ref(false);
const originalHome = {};

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入家庭名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
};

// 格式化日期（只显示年月日）
const formatDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// 格式化日期时间（显示年月日时分）
const formatDateTime = (dateTime) => {
  if (!dateTime) return "N/A";

  const d = new Date(dateTime);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 加载家庭信息
const loadHomeInfo = async () => {
  try {
    const res = await getHomeInfo();
    if (res.status === 200 && res.result.home) {
      const home = res.result.home;
      homeForm.id = home.id;
      homeForm.name = home.name;
      homeForm.createdAt = home.createdAt;
      homeForm.updatedAt = home.updatedAt;
    }
  } catch (error) {
    console.error("加载家庭信息失败:", error);
    ElMessage.error("加载家庭信息失败，请稍后再试");
  }
};

// 加载家庭成员
const loadHomeMembers = async () => {
  membersLoading.value = true;
  try {
    const res = await getHomeMembers();
    if (res.status === 200 && res.result.members) {
      members.value = res.result.members;
      membersCount.value = res.result.total || members.value.length;
    }
  } catch (error) {
    console.error("加载家庭成员失败:", error);
    ElMessage.error("加载家庭成员失败，请稍后再试");
  } finally {
    membersLoading.value = false;
  }
};

// 加载设备统计信息
const loadDeviceStats = async () => {
  try {
    const res = await getDeviceStats();
    if (res.status === 200 && res.result.stats) {
      deviceStats.total = res.result.stats.total;
      deviceStats.online = res.result.stats.online;
      deviceStats.offline = res.result.stats.offline;
    }
  } catch (error) {
    console.error("加载设备统计信息失败:", error);
  }
};

// 开始编辑
const startEdit = () => {
  // 保存原始数据，用于取消编辑时恢复
  Object.assign(originalHome, homeForm);
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据
  Object.assign(homeForm, originalHome);
  isEditing.value = false;
};

// 保存更改
const saveChanges = async () => {
  if (!homeFormRef.value) return;

  try {
    await homeFormRef.value.validate();

    loading.value = true;

    // 调用更新家庭信息API
    const res = await updateHomeInfo({
      name: homeForm.name,
    });

    if (res.status === 200) {
      ElMessage.success("家庭信息更新成功");
      // 更新表单中的数据
      if (res.result.home) {
        homeForm.updatedAt = res.result.home.updatedAt;
      }
      isEditing.value = false;
    } else {
      ElMessage.error(res.message || "更新家庭信息失败");
    }
  } catch (error) {
    console.error("更新家庭信息失败", error);
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.message || "更新失败");
    } else {
      ElMessage.error("更新家庭信息失败，请稍后再试");
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 加载家庭信息
  loadHomeInfo();

  // 加载家庭成员
  loadHomeMembers();

  // 加载设备统计信息
  loadDeviceStats();
});
</script>

<style scoped>
.home-info {
  max-width: 1200px;
  margin: 0 auto;
  display: contents;
  width: 100%;
  padding: 0 12px;
}

.home-card,
.home-stats,
.members-card {
  margin-bottom: 24px;
  border-radius: 12px;
  height: 100%;
  transition: all 0.3s ease;
}

.home-card:hover,
.home-stats:hover,
.members-card:hover {
  transform: translateY(-5px);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 8px;
  font-size: 20px;
}

.home-form {
  max-width: 100%;
  padding: 10px 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background-color: #f0f5ff;
  transform: translateX(5px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 20px;
  transition: all 0.3s ease;
}

.stat-icon:hover {
  transform: scale(1.1);
}

.user-icon {
  background-color: #ecf5ff;
  color: #409eff;
}

.device-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.date-icon {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

@media (max-width: 768px) {
  .home-form {
    max-width: 100%;
  }

  .action-buttons {
    justify-content: center;
  }

  .stat-item {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .home-info {
    padding: 0 20px;
  }
}
</style>
