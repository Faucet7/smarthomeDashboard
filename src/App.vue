<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303133;
  background-color: #ffffff;
}

* {
  box-sizing: border-box;
}

#app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

/* Element Plus 样式覆盖 */
.el-card {
  overflow: visible;
}

.el-card__body {
  padding: 20px;
}

.el-button {
  font-weight: normal;
}

.el-row {
  width: 100%;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.el-col {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
