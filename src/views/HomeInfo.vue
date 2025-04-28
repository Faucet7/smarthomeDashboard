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
                <div class="stat-value">1</div>
                <div class="stat-label">用户数量</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon device-icon">
                <el-icon size="30"><Monitor /></el-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ deviceCount }}</div>
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
} from "@element-plus/icons-vue";

// 家庭信息表单
const homeFormRef = ref(null);
const homeForm = reactive({
  id: "",
  name: "我的智能家",
  createdAt: new Date("2023-01-15"),
});

// 设备数量
const deviceCount = ref(8);

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

// 格式化日期
const formatDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// 加载家庭信息
const loadHomeInfo = () => {
  import("@/utils/auth").then(({ getUserInfo }) => {
    const parsedInfo = getUserInfo();
    if (parsedInfo) {
      homeForm.id = parsedInfo.homeId || "";
    }
  });
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

    // 这里应该调用更新家庭信息API
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success("家庭信息更新成功");
      isEditing.value = false;
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error("表单验证失败", error);
    loading.value = false;
  }
};

onMounted(() => {
  // 加载家庭信息
  loadHomeInfo();

  // 这里可以获取更多家庭详细信息
});
</script>

<style scoped>
.home-info {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 12px;
}

.home-card,
.home-stats {
  margin-bottom: 24px;
  border-radius: 12px;
  height: 100%;
  transition: all 0.3s ease;
}

.home-card:hover,
.home-stats:hover {
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
