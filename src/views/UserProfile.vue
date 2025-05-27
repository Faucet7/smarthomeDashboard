<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <div class="avatar-container">
        <el-avatar
          :size="100"
          src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          class="avatar"
        />
        <el-button type="primary" plain size="small" class="upload-btn" disabled
          >更换头像</el-button
        >
      </div>

      <el-form
        :model="profileForm"
        :rules="rules"
        ref="profileFormRef"
        label-width="100px"
        class="profile-form"
        :disabled="!isEditing"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" />
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input v-model="profileForm.id" disabled />
        </el-form-item>

        <el-form-item label="角色">
          <el-input v-model="profileForm.identity" disabled />
        </el-form-item>

        <el-form-item v-if="isEditing">
          <el-button type="primary" @click="saveChanges" :loading="loading"
            >保存</el-button
          >
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons" v-if="!isEditing">
        <el-button type="primary" @click="startEdit" disabled
          >编辑信息</el-button
        >
        <el-button type="warning" @click="showPasswordDialog" disabled
          >修改密码</el-button
        >
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="120px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="changePassword"
            :loading="pwdLoading"
          >
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getUserDetail,
  updateUserInfo,
  changePassword as changePasswordApi,
} from "@/api/user";

// 用户信息表单
const profileFormRef = ref(null);
const profileForm = reactive({
  id: "admin",
  username: "超级管理员",
  identity: "超级管理员",
});

// 编辑状态管理
const isEditing = ref(false);
const loading = ref(false);
const originalProfile = {};

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
};

// 修改密码相关
const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);
const pwdLoading = ref(false);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 密码表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else {
    if (passwordForm.confirmPassword !== "") {
      passwordFormRef.value.validateField("confirmPassword");
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const passwordRules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" },
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: "blur" },
  ],
};

// 开始编辑
const startEdit = () => {
  // 保存原始数据，用于取消编辑时恢复
  Object.assign(originalProfile, profileForm);
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据
  Object.assign(profileForm, originalProfile);
  isEditing.value = false;
};

// 保存更改
const saveChanges = async () => {
  if (!profileFormRef.value) return;

  try {
    await profileFormRef.value.validate();

    loading.value = true;

    // 调用更新用户信息API
    const res = await updateUserInfo({
      name: profileForm.username,
    });

    if (res.status === 200) {
      ElMessage.success("个人信息更新成功");
      isEditing.value = false;
    } else {
      ElMessage.error(res.message || "更新个人信息失败");
    }
  } catch (error) {
    console.error("更新个人信息失败", error);
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.message || "更新失败");
    } else {
      ElMessage.error("更新个人信息失败，请稍后再试");
    }
  } finally {
    loading.value = false;
  }
};

// 显示修改密码对话框
const showPasswordDialog = () => {
  // 重置密码表单
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordDialogVisible.value = true;
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    pwdLoading.value = true;

    // 调用修改密码API
    const res = await changePasswordApi({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (res.status === 200) {
      ElMessage.success("密码修改成功");
      passwordDialogVisible.value = false;
    } else {
      ElMessage.error(res.message || "密码修改失败");
    }
  } catch (error) {
    console.error("密码修改失败", error);
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.message || "修改失败");
    } else {
      ElMessage.error("密码修改失败，请稍后再试");
    }
  } finally {
    pwdLoading.value = false;
  }
};

// 使用API加载用户详情
const loadUserDetail = async () => {
  try {
    const res = await getUserDetail();

    if (res.status === 200 && res.result.user) {
      const userData = res.result.user;

      // 更新表单数据
      profileForm.id = userData.id || "";
      profileForm.username = userData.name || userData.username || "";
      profileForm.homeId = userData.homeId || "";
      profileForm.identity = userData.type?.name || "用户";
    }
  } catch (error) {
    console.error("加载用户信息失败:", error);
    ElMessage.warning("加载用户详情失败，请稍后再试");

    // 如果API调用失败，使用localStorage中的信息作为备选
    loadUserInfoFromStorage();
  }
};

// 从本地存储加载用户信息（作为备选）
const loadUserInfoFromStorage = () => {
  import("@/utils/auth").then(({ getUserInfo }) => {
    const parsedInfo = getUserInfo();
    if (parsedInfo) {
      profileForm.id = parsedInfo.id || "";
      profileForm.username = parsedInfo.name || parsedInfo.username || "";
      profileForm.homeId = parsedInfo.homeId || "";
      profileForm.identity =
        parsedInfo.type?.name || parsedInfo.identity || "用户";
    }
  });
};

onMounted(() => {
  // 使用API加载用户详情
  loadUserDetail();
});
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.profile-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar {
  margin-bottom: 15px;
}

.upload-btn {
  font-size: 14px;
}

.profile-form {
  /* max-width: 500px; */
  padding-right: 80px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .profile-form {
    max-width: 100%;
  }

  .el-form-item {
    margin-bottom: 18px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
