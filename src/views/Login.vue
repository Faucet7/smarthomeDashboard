<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-header">
        <h1>智能家居</h1>
      </div>

      <h2>用户登录</h2>

      <el-form
        :model="loginForm"
        ref="loginFormRef"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        <!-- <div class="form-footer">
          <span>没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { login } from "@/api/user";
import { setToken, setUserInfo } from "@/utils/auth";

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();

    loading.value = true;

    try {
      console.log("登录数据:", loginForm); // 用于调试
      const res = await login(loginForm);

      console.log("登录响应:", res); // 查看完整响应

      if (res.status === 200) {
        // 使用auth.js中的方法保存token
        setToken(res.result.token);

        // 保存用户信息
        const userInfo = {
          id: res.result.userId,
          username: res.result.user.username,
          name: res.result.user.name,
          type: res.result.user.type,
        };

        // 使用auth.js中的方法保存用户信息
        setUserInfo(userInfo);

        ElMessage.success("登录成功");
        router.push("/");
      } else {
        ElMessage.error(res.message || "登录失败");
      }
    } catch (error) {
      console.error("登录请求失败", error);

      let errorMsg = "登录失败，请检查网络连接";
      if (error.response) {
        errorMsg = `错误(${error.response.status}): ${
          error.response.data.error ||
          error.response.data.message ||
          error.response.statusText
        }`;
        console.error("错误详情:", error.response.data);
      }

      ElMessage.error(errorMsg);
    } finally {
      loading.value = false;
    }
  } catch (error) {
    console.error("表单验证失败", error);
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("@/assets/image.png") center center/cover no-repeat;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.login-card {
  width: 100%;
  max-width: 480px;
  min-width: 340px;
  min-height: 420px;
  padding: 48px 40px 36px 40px;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 28px;
  color: #222;
  margin: 0;
  letter-spacing: 2px;
  font-weight: 700;
}

h2 {
  font-size: 22px;
  color: #333;
  text-align: center;
  font-weight: 500;
}

.login-form {
  margin-top: 20px;
  width: 100%;
}

.el-input {
  height: 50px;
}

.login-button {
  width: 100%;
  padding: 14px 0;
  font-size: 20px;
  border-radius: 12px;
  font-weight: 600;
  height: 50px;
}

.form-footer {
  margin-top: 18px;
  text-align: center;
  font-size: 15px;
  color: #222;
}

.form-footer a {
  color: #222;
  text-decoration: underline;
  margin-left: 5px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: #222 !important;
  font-size: 16px;
  box-shadow: none !important;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

@media (max-width: 600px) {
  .login-card {
    max-width: 98vw;
    padding: 32px 10px 24px 10px;
  }
}
</style>
