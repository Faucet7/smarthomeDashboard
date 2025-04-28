<template>
  <div class="device-log">
    <div class="page-header">
      <div class="back-button">
        <el-button @click="$router.back()" text>
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
      </div>
      <h2 class="device-title">{{ deviceName }} - 设备日志</h2>
    </div>

    <!-- 日志过滤 -->
    <div class="filter-section">
      <el-select
        v-model="logTypeFilter"
        placeholder="日志类型"
        class="type-filter"
      >
        <el-option label="全部" value="" />
        <el-option label="信息" value="info" />
        <el-option label="警告" value="warning" />
        <el-option label="错误" value="error" />
        <el-option label="状态变化" value="status" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="date-filter"
        value-format="YYYY-MM-DD"
      />

      <el-button type="primary" @click="loadLogs">
        <el-icon><Search /></el-icon>筛选
      </el-button>

      <el-button @click="exportLogs">
        <el-icon><Download /></el-icon>导出
      </el-button>
    </div>

    <!-- 日志表格 -->
    <el-card class="log-card">
      <el-table
        :data="filteredLogs"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
        v-loading="loading"
      >
        <el-table-column type="index" width="50" align="center" label="#" />
        <el-table-column
          prop="timestamp"
          label="时间"
          sortable
          :formatter="formatTimestamp"
          min-width="180"
        />
        <el-table-column
          prop="type"
          label="类型"
          width="100"
          :filters="logTypeOptions"
          :filter-method="filterLogType"
        >
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.type)" size="small">
              {{ getLogTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="内容"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="operator"
          label="操作者"
          min-width="120"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalLogs"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Search, Download } from "@element-plus/icons-vue";

const route = useRoute();
const deviceId = computed(() => route.params.deviceId);
const deviceName = ref("设备名称"); // 实际应该从API获取

// 日志过滤
const logTypeFilter = ref("");
const dateRange = ref([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalLogs = ref(0);

// 日志类型选项
const logTypeOptions = [
  { text: "信息", value: "info" },
  { text: "警告", value: "warning" },
  { text: "错误", value: "error" },
  { text: "状态变化", value: "status" },
];

// 模拟日志数据
const allLogs = ref([
  {
    id: 1,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-15 08:30:15"),
    type: "info",
    content: "设备启动",
    operator: "system",
  },
  {
    id: 2,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-15 10:25:30"),
    type: "status",
    content: "设备状态变更: 开启",
    operator: "张三",
  },
  {
    id: 3,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-15 15:40:22"),
    type: "status",
    content: "设备状态变更: 关闭",
    operator: "张三",
  },
  {
    id: 4,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-16 09:12:05"),
    type: "warning",
    content: "设备响应超时",
    operator: "system",
  },
  {
    id: 5,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-16 09:15:30"),
    type: "info",
    content: "设备恢复正常",
    operator: "system",
  },
  {
    id: 6,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-16 14:20:10"),
    type: "status",
    content: "设备状态变更: 开启",
    operator: "李四",
  },
  {
    id: 7,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-17 18:30:45"),
    type: "error",
    content: "设备连接失败",
    operator: "system",
  },
  {
    id: 8,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-17 19:05:12"),
    type: "info",
    content: "设备重新连接成功",
    operator: "system",
  },
  {
    id: 9,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-18 11:45:33"),
    type: "status",
    content: "设备亮度调整: 80%",
    operator: "张三",
  },
  {
    id: 10,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-18 21:10:15"),
    type: "status",
    content: "设备状态变更: 关闭",
    operator: "system",
  },
  {
    id: 11,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-19 07:30:00"),
    type: "status",
    content: "设备状态变更: 开启",
    operator: "system",
  },
  {
    id: 12,
    deviceId: deviceId.value,
    timestamp: new Date("2023-06-19 22:00:00"),
    type: "status",
    content: "设备状态变更: 关闭",
    operator: "system",
  },
]);

// 过滤后的日志
const filteredLogs = computed(() => {
  let result = [...allLogs.value];

  // 按类型过滤
  if (logTypeFilter.value) {
    result = result.filter((log) => log.type === logTypeFilter.value);
  }

  // 按日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0]);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);

    result = result.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // 更新总数
  totalLogs.value = result.length;

  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return result.slice(start, end);
});

// 格式化时间戳
const formatTimestamp = (row) => {
  const date = new Date(row.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取日志类型名称
const getLogTypeName = (type) => {
  const typeMap = {
    info: "信息",
    warning: "警告",
    error: "错误",
    status: "状态变化",
  };
  return typeMap[type] || type;
};

// 获取标签类型
const getTagType = (type) => {
  const typeMap = {
    info: "",
    warning: "warning",
    error: "danger",
    status: "success",
  };
  return typeMap[type] || "";
};

// 过滤日志类型
const filterLogType = (value, row) => {
  return row.type === value;
};

// 加载日志
const loadLogs = () => {
  loading.value = true;

  // 实际项目中应该调用API获取日志
  // 模拟API调用延迟
  setTimeout(() => {
    loading.value = false;

    // 重置到第一页
    currentPage.value = 1;

    ElMessage.success("日志加载成功");
  }, 500);
};

// 导出日志
const exportLogs = () => {
  ElMessage.success("日志导出功能将在后续实现");
};

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 初始化加载
onMounted(() => {
  // 获取设备信息
  // 模拟API调用
  setTimeout(() => {
    deviceName.value = "客厅灯";
  }, 300);

  // 加载日志
  loadLogs();
});
</script>

<style scoped>
.device-log {
  padding-bottom: 40px;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  margin-right: 15px;
}

.device-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.filter-section {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.type-filter {
  width: 150px;
}

.date-filter {
  width: 350px;
}

.log-card {
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .type-filter,
  .date-filter {
    width: 100%;
  }
}
</style>
