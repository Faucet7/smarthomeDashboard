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
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
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

        <div class="form-footer">
          <span>没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.logo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

h2 {
  font-size: 20px;
  color: #606266;
  text-align: center;
  margin-bottom: 25px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.form-footer {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}
</style>
