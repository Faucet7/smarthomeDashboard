<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-header">
        <h1>智能家居</h1>
      </div>

      <h2>用户注册</h2>

      <el-form
        :model="registerForm"
        ref="registerFormRef"
        :rules="rules"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
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
import { register, registerAlt1, registerAlt2, registerAlt3 } from "@/api/user";

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});

const validatePass = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else {
    if (registerForm.confirmPassword !== "") {
      registerFormRef.value.validateField("confirmPassword");
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, message: "用户名长度不能少于3位", trigger: "blur" },
  ],
  password: [{ required: true, validator: validatePass, trigger: "blur" }],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: "blur" },
  ],
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  try {
    await registerFormRef.value.validate();

    loading.value = true;

    try {
      // 尝试不同的数据格式
      const registerData = {
        username: registerForm.username,
        password: registerForm.password,
      };

      // 备选数据格式1 - homeId 作为数字
      const registerDataAlt1 = {
        username: registerForm.username,
        password: registerForm.password,
        homeId: Number(registerForm.homeId),
      };

      // 备选数据格式2 - 使用 homeName 而不是 homeId
      const registerDataAlt2 = {
        username: registerForm.username,
        password: registerForm.password,
        homeName: registerForm.homeId,
      };

      console.log("注册数据格式1:", registerData);
      console.log("注册数据格式2:", registerDataAlt1);
      console.log("注册数据格式3:", registerDataAlt2);

      let res;
      let successMethod = "";
      let successData = null;

      // 尝试各种可能的方法和数据格式组合
      const attempts = [
        { method: register, name: "默认POST", data: registerData },
        { method: register, name: "默认POST+数字ID", data: registerDataAlt1 },
        { method: register, name: "默认POST+homeName", data: registerDataAlt2 },
        { method: registerAlt1, name: "PUT", data: registerData },
        { method: registerAlt1, name: "PUT+数字ID", data: registerDataAlt1 },
        { method: registerAlt2, name: "不同URL", data: registerData },
        { method: registerAlt3, name: "无前导斜杠", data: registerData },
      ];

      for (const attempt of attempts) {
        try {
          console.log(`尝试: ${attempt.name}`);
          res = await attempt.method(attempt.data);
          successMethod = attempt.name;
          successData = attempt.data;
          console.log("成功的数据格式:", successData);
          break; // 如果成功，跳出循环
        } catch (err) {
          console.error(`${attempt.name}失败:`, err);
          // 继续尝试下一个
        }
      }

      if (!res) {
        throw new Error("所有注册方法均失败");
      }

      console.log("成功使用方法:", successMethod);

      if (res.status === 200) {
        ElMessage.success(`注册成功(使用${successMethod})，请登录`);
        router.push("/login");
      } else {
        ElMessage.error(res.msg || "注册失败");
      }
    } catch (error) {
      console.error("所有注册方法均失败:", error);
      let errorMsg = "注册失败，请检查网络连接或联系管理员";

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
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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

.register-card {
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
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.register-form {
  margin-top: 1rem;
}

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.form-footer {
  margin-top: 1rem;
  text-align: center;
  font-size: 14px;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
