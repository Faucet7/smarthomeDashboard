import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";

// 导入mock服务
import { setupMocks } from "./mock";

// 初始化mock服务
setupMocks();

const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.mount("#app");
