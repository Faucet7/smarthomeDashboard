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
          :class="[{ 'device-offline': device.state.value === 'offline' }]"
          @click="selectedDeviceId ? null : showController(device, $event)"
        >
          <div class="device-info-only">
            <div
              v-if="getIconTypeByName(device.name)"
              class="device-icon-img"
              v-html="getDeviceIcon(getIconTypeByName(device.name))"
            ></div>
            <div
              class="status-dot"
              :class="
                device.state.value === 'online'
                  ? 'status-online'
                  : 'status-offline'
              "
            ></div>
            <h3 class="device-name">{{ device.name }}</h3>
            <div
              class="device-status"
              :class="
                device.state.value === 'online'
                  ? 'status-online'
                  : 'status-offline'
              "
            >
              {{ device.state.value === "online" ? "开" : "关" }}
            </div>
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
        :page-sizes="[24, 36, 48]"
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

    <!-- 控制器聚焦遮罩浮层 -->
    <div
      v-if="selectedDeviceId"
      class="controller-overlay"
      ref="overlayRef"
      @click="onOverlayClick"
    >
      <div
        class="controller-float-card"
        ref="floatCardRef"
        :style="floatCardStyle"
      >
        <div class="controller-content">
          <div class="controller-body">
            <div class="controller-header">
              <div
                v-if="
                  getIconTypeByName(
                    filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                  )
                "
                class="device-icon-img controller-icon"
                v-html="
                  getDeviceIcon(
                    getIconTypeByName(
                      filteredDevices.find((d) => d.id === selectedDeviceId)
                        ?.name
                    )
                  )
                "
              ></div>
              <div class="device-name controller-name">
                {{
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                }}
              </div>
            </div>

            <template
              v-if="
                getIconTypeByName(
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                ) === 'curtain'
              "
            >
              <div class="control-cards">
                <!-- 一键开关卡片 -->
                <div class="control-card curtain-switch-card">
                  <div class="card-icon">
                    <img :src="iconBase64.curtain" alt="" />
                  </div>
                  <div class="card-content">
                    <div class="card-title">一键开关</div>
                    <div class="card-control">
                      <el-button
                        class="curtain-switch-btn"
                        @click="
                          controllerState.curtainOpen =
                            !controllerState.curtainOpen
                        "
                        :type="
                          controllerState.curtainOpen ? 'primary' : 'default'
                        "
                      >
                        {{ controllerState.curtainOpen ? "开" : "关" }}
                      </el-button>
                    </div>
                  </div>
                </div>
                <!-- 拉开百分比卡片 -->
                <div class="control-card curtain-percent-card">
                  <div class="card-icon">
                    <img :src="iconBase64.curtain" alt="" />
                  </div>
                  <div class="card-content">
                    <div class="card-title">拉开百分比</div>
                    <div class="card-control">
                      <el-slider
                        v-model="controllerState.curtainPercent"
                        :min="0"
                        :max="100"
                        :step="1"
                        class="curtain-slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- ac -->
            <template
              v-else-if="
                getIconTypeByName(
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                ) === 'ac'
              "
            >
              <div class="control-cards">
                <div class="control-card power-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1OTI2OTE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MTY5IiBkYXRhLXNwbS1hbmNob3ItaWQ9ImEzMTN4LnNlYXJjaF9pbmRleC4wLmkxNi4yZmE4M2E4MW9RQm16TSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzg0IDE5Ni4yNjY2Njd2OTMuODY2NjY2Yy03Ni44IDQyLjY2NjY2Ny0xMjggMTI4LTEyOCAyMjEuODY2NjY3IDAgMTQwLjggMTE1LjIgMjU2IDI1NiAyNTZzMjU2LTExNS4yIDI1Ni0yNTZjMC05My44NjY2NjctNTEuMi0xNzkuMi0xMjgtMjIxLjg2NjY2N1YxOTYuMjY2NjY3YzEyMy43MzMzMzMgNTEuMiAyMTMuMzMzMzMzIDE3NC45MzMzMzMgMjEzLjMzMzMzMyAzMTUuNzMzMzMzIDAgMTg3LjczMzMzMy0xNTMuNiAzNDEuMzMzMzMzLTM0MS4zMzMzMzMgMzQxLjMzMzMzM3MtMzQxLjMzMzMzMy0xNTMuNi0zNDEuMzMzMzMzLTM0MS4zMzMzMzNjMC0xNDUuMDY2NjY3IDg5LjYtMjY0LjUzMzMzMyAyMTMuMzMzMzMzLTMxNS43MzMzMzN6IG04NS4zMzMzMzMtMjUuNmg4NS4zMzMzMzR2MjEzLjMzMzMzM2gtODUuMzMzMzM0VjE3MC42NjY2Njd6IiBmaWxsPSIjNDQ0NDQ0IiBwLWlkPSIxNDE3MCI+PC9wYXRoPjwvc3ZnPg=="
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">开关</div>
                    <div class="card-control">
                      <el-switch
                        v-model="controllerState.switch1"
                        class="control-switch"
                      />
                    </div>
                  </div>
                </div>

                <div class="control-card lock-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1ODM5MDcwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjggMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjExMjEzIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMC43ODEyNSIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik0wIDBoMTAyNHYxMDI0aC0xMDI0eiIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iLjAxIiBwLWlkPSIxMTIxNCI+PC9wYXRoPjxwYXRoIGQ9Ik03NDkuOTIgNDA0LjU2aC0yMC4zNnYtMTI2LjlDNzI5LjU2IDE2MC40MSA2MzQuMTcgNjUgNTE2LjkyIDY1cy0yMTIuNjQgOTUuNDEtMjEyLjY0IDIxMi42NnYxMjYuOUgyODMuOTJBMTA3LjU4IDEwNy41OCAwIDAgMCAxNzYuNDQgNTEydjMzOS41QTEwNy41NyAxMDcuNTcgMCAwIDAgMjgzLjkyIDk1OWg0NjZhMTA3LjU3IDEwNy41NyAwIDAgMCAxMDcuNDgtMTA3LjQ4VjUxMkExMDcuNTggMTA3LjU4IDAgMCAwIDc0OS45MiA0MDQuNTZ6IG0tMzkzLjc2LTEyNi45QzM1Ni4xNiAxODkgNDI4LjI4IDExNi45IDUxNi45MiAxMTYuOVM2NzcuNjggMTg5IDY3Ny42OCAyNzcuNjZ2MTI2LjlIMzU2LjE2ek04MDUuNTIgODUxLjUyQTU1LjY1IDU1LjY1IDAgMCAxIDc0OS45MiA5MDcuMUgyODMuOTJhNTUuNjUgNTUuNjUgMCAwIDEtNTUuNTgtNTUuNThWNTEyQTU1LjY0IDU1LjY0IDAgMCAxIDI4My45MiA0NTYuNDVoNDY2QTU1LjY0IDU1LjY0IDAgMCAxIDgwNS41MiA1MTJ6IiBwLWlkPSIxMTIxNSI+PC9wYXRoPjxwYXRoIGQ9Ik0zODIuNjEgNjQ4LjY1YzIyLjczIDAgNDEuMTYtMTguMDkgNDEuMTYtNDAuNDFzLTE4LjQzLTQwLjQxLTQxLjE2LTQwLjQxLTQxLjE0IDE4LjA5LTQxLjE0IDQwLjQxIDE4LjQ1IDQwLjQxIDQxLjE0IDQwLjQxeiIgcC1pZD0iMTEyMTYiPjwvcGF0aD48cGF0aCBkPSJNNjEwLjA3IDYwOC4yNGE0MS4xNSA0MC40MSAwIDEgMCA4Mi4zIDAgNDEuMTUgNDAuNDEgMCAxIDAtODIuMyAwWiIgcC1pZD0iMTEyMTciPjwvcGF0aD48cGF0aCBkPSJNNjY4Ljg1IDcxOWMtNDQuNDggNDEuMDctOTcgNjIuNzctMTUxLjg3IDYyLjc3cy0xMDcuNDgtMjEuNzMtMTUyLTYyLjg2YTIwLjc1IDIwLjc1IDAgMSAwLTI4LjE2IDMwLjQ5YzUyLjMxIDQ4LjM0IDExNC42MSA3My44OSAxODAuMTYgNzMuODlzMTI3Ljc0LTI1LjUyIDE4MC03My43OEEyMC43NSAyMC43NSAwIDEgMCA2NjguODUgNzE5eiIgcC1pZD0iMTEyMTgiPjwvcGF0aD48L3N2Zz4="
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">童锁</div>
                    <div class="card-control">
                      <el-switch
                        v-model="controllerState.childLock"
                        class="control-switch"
                      />
                    </div>
                  </div>
                </div>

                <div class="control-card fan-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1OTU4OTM4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE2MzUyIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik0xNzQuNSAzOTQuMWgzMzEuMmM5MSAwIDE2Ni03My4yIDE2Ni4zLTE2NC4yIDAuMy05MS03My43LTE2NS4xLTE2NC43LTE2NS4xLTQzLjIgMC04NCAxNi42LTExNC45IDQ2LjctMTUuNSAxNS4xLTI3LjcgMzIuOS0zNi4yIDUyLjItMTIuNyAyOS4xIDguNCA2MS43IDQwLjEgNjIuNiAxOC41IDAuNSAzNS4yLTEwLjQgNDIuNi0yNy4zIDExLjYtMjYuMiAzNy43LTQ0LjIgNjguMy00NC4yIDQxLjQgMCA3NS4xIDMzLjkgNzQuNyA3NS40LTAuNCA0MS4xLTM0LjUgNzMuOS03NS42IDczLjlIMTc0LjVjLTI0LjkgMC00NSAyMC4xLTQ1IDQ1czIwLjIgNDUgNDUgNDV6TTE4OS4zIDYzNC4ybDAuNiA0NS0wLjYtNDV6TTY4MiA2MjYuOWMtMC42IDAtMC44IDAtNDI3LjMgNi4zLTcuMyAwLjEtMTQuMiAwLjItMjAuNSAwLjMtMjQuOCAwLjQtNDQuNyAyMC44LTQ0LjMgNDUuNiAwLjMgMjQuOSAyMC44IDQ0LjggNDUuNyA0NC40IDYuMy0wLjEgMTMuMi0wLjIgMjAuNS0wLjMgMTI0LjktMS45IDQxNS4zLTYuMiA0MjYuMi02LjMgNDIuOCAwLjIgNzcuMiAzNi41IDc0LjIgODAtMi44IDM5LjgtMzUuOSA3MC03NS43IDY5LjMtMzAuMi0wLjUtNTUuOS0xOC41LTY3LjItNDQuNS03LjMtMTYuOC0yNC4xLTI3LjUtNDIuNS0yNy0zMS43IDAuOS01Mi44IDMzLjUtNDAuMSA2Mi42IDguNCAxOS40IDIwLjYgMzcuMSAzNi4yIDUyLjIgMzAuOSAzMC4xIDcxLjggNDYuNyAxMTUgNDYuNyA5MS44LTAuMSAxNjYuOC03NyAxNjQuNS0xNjguOC0yLjMtODguOS03NS4zLTE2MC41LTE2NC43LTE2MC41eiIgcC1pZD0iMTYzNTMiPjwvcGF0aD48cGF0aCBkPSJNODU2LjYgMjQwLjNjLTI5LTExLjUtNjAuNSAxMC4xLTYwLjUgNDEuNHYxLjNjMCAxOCAxMC45IDM0LjQgMjcuNiA0MS4xIDI3LjUgMTEgNDcgMzggNDcgNjkuNCAwIDQxLjItMzMuNSA3NC43LTc0LjcgNzQuN0gxMTIuNmMtMjQuOSAwLTQ1IDIwLjEtNDUgNDVzMjAuMSA0NSA0NSA0NWg2ODMuNWM5MC44IDAgMTY0LjctNzMuOSAxNjQuNy0xNjQuNy0wLjEtNjkuNS00My4zLTEyOS0xMDQuMi0xNTMuMnoiIHAtaWQ9IjE2MzU0Ij48L3BhdGg+PC9zdmc+"
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">风速</div>
                    <div class="card-control">
                      <!-- <el-button class="fan-speed-btn" @click="cycleFanSpeed">
                        {{ getFanSpeedText(controllerState.fanSpeed) }}
                      </el-button> -->
                      <el-radio-group
                        v-model="controllerState.fanSpeed"
                        size="default"
                      >
                        <el-radio-button label="低" value="low" />
                        <el-radio-button label="中" value="mid" />
                        <el-radio-button label="高" value="high" />
                        <el-radio-button label="自动" value="auto" />
                      </el-radio-group>
                    </div>
                  </div>
                </div>

                <div class="control-card mode-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MzQ0ODM4MjU2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE3Mzg3IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik04NzIuODAyOTI4IDc1NS45OTQwNiA4NzIuODY0MzI2IDc1NS45OTQwNiA4NzIuODY0MzI2IDc1NS42MjQ2NDZaIiBmaWxsPSIjMjcyNTM2IiBwLWlkPSIxNzM4OCI+PC9wYXRoPjxwYXRoIGQ9Ik00MDAuODA3MDM3IDU0Mi41MTgwNjFjLTAuNTg4NDAxLTAuMjI0MTA0LTEuMjMzMDg0LTAuMzY0Mjk3LTEuODc2NzQ0LTAuMzY0Mjk3TDE5Ny44MDA0ODMgNTQyLjE1Mzc2NGMtNDQuMzU4Mjc3IDAtODAuNzEzMjc2IDM1LjgzNTE2LTgxLjIzMTA2OSA3OS45OTkwMDktMC4wMjY2MDYgMC4xOTU0NTEtMC4wMjY2MDYgMC4zNjMyNzQtMC4wMjY2MDYgMC41NjE3OTVsMCAxODkuOTM4OTMzYzAgMi41NTAwNzkgMC40MzI4NTkgNS4xNTg0ODcgMS4xNzY4MDIgNy4yNjQ0NTEgNi42ODgzMjkgMzkuMDU3NTUxIDQwLjMzNTY2IDY3LjQzMjgwOSA4MC4wODA4NzMgNjcuNDMyODA5TDM5OC45MjkyNyA4ODcuMzUwNzZjMC41ODg0MDEgMCAxLjEyMDUyLTAuMTExNTQgMS42NTM2NjMtMC4zMzY2NjggMzcuMTc5Nzg0LTIuODYzMjExIDY3LjI5NTY4Ni0zMC4zMTIzNzYgNzMuMjk0MzA2LTY2LjI4MzYzNiAxLjAxMTAyNy0yLjc0ODYgMS40NTgyMTEtNS40OTkyNDggMS40NTgyMTEtOC4xMzExOTFsMC0xODkuODg0Njk4YzAtMC4xOTc0OTggMC0wLjM2NTMyIDAtMC41MzQxNjZDNDc0LjgzMzAwNyA1ODAuNTQxMDQ5IDQ0Mi4zNjI0NzggNTQ1Ljk0MTAyIDQwMC44MDcwMzcgNTQyLjUxODA2MU00MjUuMjU5OTYyIDYyNy4xNDI0MTNsMCAxNzUuMjE5Njk3YzAgMTkuMzQ2NjI3LTE1Ljc4NzU2OCAzNS4wNTEzMDctMzUuMjE5MTI5IDM1LjA1MTMwN0wyMDguNzY0MTg2IDgzNy40MTM0MThjLTAuMzM1NjQ0LTAuMDU5MzUyLTAuNzE1MjkxLTAuMDU5MzUyLTEuMDY2Mjg1IDBsLTUuODcyNzU0IDBjLTE5LjM5MDYyOSAwLTM1LjE3NzE3NC0xNS43MDQ2OC0zNS4xNzcxNzQtMzUuMDUxMzA3TDE2Ni42NDc5NzMgNjI3LjE0MjQxM2MwLTE5LjI5MjM5MiAxNS43ODY1NDUtMzUuMDIwNjA4IDM1LjE3NzE3NC0zNS4wMjA2MDhsMTg4LjIxNDY2MiAwQzQwOS40NzIzOTQgNTkyLjEyMTgwNSA0MjUuMjU5OTYyIDYwNy44NTAwMjIgNDI1LjI1OTk2MiA2MjcuMTQyNDEzIiBmaWxsPSIjMjMxRjIwIiBwLWlkPSIxNzM4OSI+PC9wYXRoPjxwYXRoIGQ9Ik04OTIuNTk1NzE2IDE5MS4yOTQ4MTRjLTAuNDc2ODYxLTQxLjYyNTAyNi0zMi45NzM5OTYtNzYuMjI3MTAyLTc0LjUwMTgwOC03OS42NDY5OTEtMC42MTYwMy0wLjIyMzA4MS0xLjIzNDEwNy0wLjM2MzI3NC0xLjkwNDM3My0wLjM2MzI3NEw2MzYuMzcwMDc3IDExMS4yODQ1NDljLTQ0LjU1Njc5OCAwLTgxLjAzNTYxOCAzNi4xMTQ1MjItODEuMjYwNzQ1IDgwLjU1NjcxMWwwIDE4OS45NDA5OGMwIDIuNjM2MDM3IDAuNDQ5MjMxIDUuMzQxNjU4IDEuMTc5ODcyIDcuMjYyNDA0IDYuNjcyOTggMzkuMDQ2Mjk1IDQwLjI4OTYxMiA2Ny40MjE1NTIgODAuMDgwODczIDY3LjQyMTU1MmwxNzkuODE5NDU4IDBjMC41ODg0MDEgMCAxLjEyMTU0NC0wLjExMTU0IDEuNjUyNjQtMC4zMjIzNDEgMzcuMTU0MjAxLTIuODczNDQ0IDY3LjMyMzMxNS0zMC4zMjU2NzkgNzMuMzUxNjEyLTY2LjMwMDAwOSAwLjk1MzcyMS0yLjY5MTI5NSAxLjQwMTkyOS01LjQyNjU5MyAxLjQwMTkyOS04LjExODkxMWwwLTE4OS44ODQ2OThDODkyLjU5NTcxNiAxOTEuNjQ0Nzg1IDg5Mi41OTU3MTYgMTkxLjQ3NTkzOSA4OTIuNTk1NzE2IDE5MS4yOTQ4MTRNODQyLjUxNjEzNCAxOTYuMjcwMTI5bDAgMTc1LjIwNjM5NGMwIDE5LjM0ODY3NC0xNS43ODU1MjEgMzUuMDQ5MjYxLTM1LjE2MDgwMSAzNS4wNDkyNjFMNjQwLjM0OTcxNSA0MDYuNTI1Nzg0Yy0xOS4zNzQyNTYgMC0zNS4xNjA4MDEtMTUuNzAxNjEtMzUuMTYwODAxLTM1LjA0OTI2MUw2MDUuMTg4OTE0IDE5Ni4yNzAxMjljMC0xOS4zMDM2NDggMTUuNzg3NTY4LTM1LjAzNDkzNCAzNS4xNjA4MDEtMzUuMDM0OTM0bDE2Ny4wMDU2MTggMEM4MjYuNzMwNjEzIDE2MS4yMzUxOTUgODQyLjUxNjEzNCAxNzYuOTY2NDgxIDg0Mi41MTYxMzQgMTk2LjI3MDEyOSIgZmlsbD0iIzIzMUYyMCIgcC1pZD0iMTczOTAiPjwvcGF0aD48cGF0aCBkPSJNODE4LjA5MzkwOCA1NDIuNTE4MDYxYy0wLjYxNjAzLTAuMjI0MTA0LTEuMjM0MTA3LTAuMzY0Mjk3LTEuOTA0MzczLTAuMzY0Mjk3TDYzNi4zNzAwNzcgNTQyLjE1Mzc2NGMtNDQuNTU2Nzk4IDAtODEuMDM1NjE4IDM2LjExNjU2OS04MS4yNjA3NDUgODAuNTYwODA0bDAgMTg5LjkzODkzM2MwIDIuNjM2MDM3IDAuNDQ5MjMxIDUuMzUzOTM4IDEuMTc5ODcyIDcuMjY0NDUxIDYuNjcyOTggMzkuMDU3NTUxIDQwLjI4OTYxMiA2Ny40MzI4MDkgODAuMDgwODczIDY3LjQzMjgwOWwxNzkuODE5NDU4IDBjMC41ODg0MDEgMCAxLjEyMTU0NC0wLjExMTU0IDEuNjUyNjQtMC4zMzY2NjggMzcuMTU0MjAxLTIuODYzMjExIDY3LjMyMzMxNS0zMC4zMTIzNzYgNzMuMzUxNjEyLTY2LjI4MzYzNiAwLjk1MzcyMS0yLjY5MzM0MiAxLjQwMTkyOS01LjQzOTg5NiAxLjQwMTkyOS04LjEzMTE5MWwwLTE4OS44ODQ2OThjMC0wLjE5NzQ5OCAwLTAuMzY1MzIgMC0wLjUzNDE2NkM4OTIuMTE4ODU1IDU4MC41NDEwNDkgODU5LjYyMTcyIDU0NS45NDEwMiA4MTguMDkzOTA4IDU0Mi41MTgwNjFNODQyLjUxNjEzNCA2MjcuMTQyNDEzbDAgMTc1LjIxOTY5N2MwIDE5LjM0NjYyNy0xNS43ODU1MjEgMzUuMDUxMzA3LTM1LjE2MDgwMSAzNS4wNTEzMDdMNjQwLjM0OTcxNSA4MzcuNDEzNDE4Yy0xOS4zNzQyNTYgMC0zNS4xNjA4MDEtMTUuNzA0NjgtMzUuMTYwODAxLTM1LjA1MTMwN0w2MDUuMTg4OTE0IDYyNy4xNDI0MTNjMC0xOS4yOTIzOTIgMTUuNzg3NTY4LTM0Ljk5MTk1NSAzNS4xNjA4MDEtMzQuOTkxOTU1bDE2Ny4wMDU2MTggMEM4MjYuNzMwNjEzIDU5Mi4xNDk0MzUgODQyLjUxNjEzNCA2MDcuODUwMDIyIDg0Mi41MTYxMzQgNjI3LjE0MjQxMyIgZmlsbD0iIzIzMUYyMCIgcC1pZD0iMTczOTEiPjwvcGF0aD48cGF0aCBkPSJNNDAwLjgwNzAzNyAxMTEuNjQ2Nzk5Yy0wLjU4ODQwMS0wLjIyMzA4MS0xLjIzMzA4NC0wLjM2MzI3NC0xLjg3Njc0NC0wLjM2MzI3NEwxOTcuODAwNDgzIDExMS4yODM1MjZjLTQ0LjM1ODI3NyAwLTgwLjcxMzI3NiAzNS44MzUxNi04MS4yMzEwNjkgNzkuOTgzNjU5LTAuMDI2NjA2IDAuMjA5Nzc4LTAuMDI2NjA2IDAuMzc3Ni0wLjAyNjYwNiAwLjU3MzA1MWwwIDE4OS45NDA5OGMwIDIuNTUzMTQ5IDAuNDMyODU5IDUuMTYwNTMzIDEuMTc2ODAyIDcuMjYyNDA0IDYuNjg4MzI5IDM5LjA0NjI5NSA0MC4zMzU2NiA2Ny40MjE1NTIgODAuMDgwODczIDY3LjQyMTU1MkwzOTguOTI5MjcgNDU2LjQ2NTE3M2MwLjU4ODQwMSAwIDEuMTIwNTItMC4xMTE1NCAxLjY1MzY2My0wLjMyMjM0MSAzNy4xNzk3ODQtMi44NzM0NDQgNjcuMjk1Njg2LTMwLjMyNTY3OSA3My4yOTQzMDYtNjYuMzAwMDA5IDEuMDExMDI3LTIuODAzODU5IDEuNDU4MjExLTUuNDU0MjIyIDEuNDU4MjExLTguMTE4OTExbDAtMTg5Ljg4NDY5OGMwLTAuMTk1NDUxIDAtMC4zNjMyNzQgMC0wLjU0NTQyMkM0NzQuODMzMDA3IDE0OS42Njk3ODggNDQyLjM2MjQ3OCAxMTUuMDY3NzEyIDQwMC44MDcwMzcgMTExLjY0Njc5OU00MjUuMjU5OTYyIDE5Ni4yNzAxMjlsMCAxNzUuMjA2Mzk0YzAgMTkuMzQ4Njc0LTE1Ljc4NzU2OCAzNS4wNDkyNjEtMzUuMjE5MTI5IDM1LjA0OTI2MUwyMDEuODI1MTQ3IDQwNi41MjU3ODRjLTE5LjM5MDYyOSAwLTM1LjE3NzE3NC0xNS43MDE2MS0zNS4xNzcxNzQtMzUuMDQ5MjYxTDE2Ni42NDc5NzMgMTk2LjI3MDEyOWMwLTE5LjMwMzY0OCAxNS43ODY1NDUtMzUuMDM0OTM0IDM1LjE3NzE3NC0zNS4wMzQ5MzRsMTg4LjIxNDY2MiAwQzQwOS40NzIzOTQgMTYxLjIzNTE5NSA0MjUuMjU5OTYyIDE3Ni45NjY0ODEgNDI1LjI1OTk2MiAxOTYuMjcwMTI5IiBmaWxsPSIjMjMxRjIwIiBwLWlkPSIxNzM5MiI+PC9wYXRoPjwvc3ZnPg=="
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">工作模式</div>
                    <div class="card-control">
                      <el-radio-group
                        v-model="controllerState.workMode"
                        size="default"
                        :disabled="controllerState.switch1"
                      >
                        <el-radio-button label="制冷" value="cool" />
                        <el-radio-button label="制热" value="heat" />
                        <el-radio-button label="吹风" value="fan_only" />
                      </el-radio-group>
                    </div>
                  </div>
                </div>

                <div class="control-card temp-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1ODg5Nzk5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEzMTUzIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik01OTcuMzMzMzMzIDUwMy4wNGwxNzcuOTIgMTAyLjgyNjY2NyAxNTcuODY2NjY3LTQyLjY2NjY2N2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxIDUxLjIgMjkuNDQgNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS0yOS44NjY2NjcgNTEuMmwtNzcuMjI2NjY2IDIwLjkwNjY2NyA1OS4zMDY2NjYgMzQuMTMzMzMzYTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMTUuMzYgNTguNDUzMzMzIDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEtNTguMDI2NjY2IDE1LjM2bC02NS43MDY2NjctMzcuNTQ2NjY2IDI1LjE3MzMzMyA5Mi4xNmE0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTgyLjM0NjY2NiAyMi4xODY2NjZMNzI1LjMzMzMzMyA2NzQuNTZsLTE3OS42MjY2NjYtMTAyLjgyNjY2N3YyMjEuNDRsMTE2LjA1MzMzMyAxMTcuMzMzMzM0YTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMCA1OC44OCA0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTU4LjAyNjY2NyAwbC01OC4wMjY2NjYtNTguNDUzMzM0Vjk4MS4zMzMzMzNhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS04NS4zMzMzMzQgMHYtNzQuNjY2NjY2TDQwMS4wNjY2NjcgOTY1Ljk3MzMzM2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTU3LjE3MzMzNCAwIDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMC01Ny42bDExNi40OC0xMTYuOTA2NjY2di0yMDkuMDY2NjY3TDI4My43MzMzMzMgNjgyLjY2NjY2N2wtNDIuNjY2NjY2IDE1OS4xNDY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS01MS4yIDI5LjQ0IDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEtMjkuMDEzMzM0LTUwLjM0NjY2NmwyMS43Ni03OS4zNi02MS4wMTMzMzMgMzQuOTg2NjY2YTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEtNTguMDI2NjY3LTE1LjM2IDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMTUuMzYtNTguNDUzMzMzbDY0Ljg1MzMzNC0zNy41NDY2NjctODEuMDY2NjY3LTIxLjMzMzMzM0E0MC41MzMzMzMgNDAuNTMzMzMzIDAgMSAxIDg1LjMzMzMzMyA1NjcuNDY2NjY3bDE1OS4xNDY2NjcgNDIuNjY2NjY2TDQyNi42NjY2NjcgNTAzLjA0IDI0NC4wNTMzMzMgMzk3LjY1MzMzMyA4NS4zMzMzMzMgNDM5LjQ2NjY2N2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTUxLjItMjkuNDQgNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSAyOS4wMTMzMzQtNTAuMzQ2NjY3bDc5Ljc4NjY2Ni0yMC45MDY2NjctNjEuODY2NjY2LTM1LjQxMzMzM2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxIDQyLjY2NjY2Ni03My44MTMzMzNsNjQuODUzMzM0IDM3LjU0NjY2Ni0yMS43Ni04MS4wNjY2NjZhNDAuMTA2NjY3IDQwLjEwNjY2NyAwIDAgMSAyOC41ODY2NjYtNDkuNDkzMzM0IDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgNDkuOTIgMjguNTg2NjY3bDQyLjY2NjY2NyAxNTkuNTczMzMzIDE3MC42NjY2NjcgOTguOTg2NjY3VjIyOC42OTMzMzNsLTExNC4zNDY2NjctMTE1LjJhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSAwLTU4Ljg4IDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgNTkuMzA2NjY3IDBsNTYuNzQ2NjY2IDU2LjMyVjQyLjY2NjY2N2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxIDg1LjMzMzMzNCAwdjc1LjUybDY3LjQxMzMzMy02Ny40MTMzMzRhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA2MC4xNiA2MC4xNmwtMTI4IDEyOHYxOTUuODRsMTg0LjMyLTEwNi42NjY2NjYgNDIuNjY2NjY3LTE1Ny44NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA1MS4yLTI5LjQ0IDQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMjkuODY2NjY2IDUxLjJsLTIxLjMzMzMzMyA3Ny4yMjY2NjcgNTkuMzA2NjY3LTM0LjEzMzMzNGE0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxIDQyLjY2NjY2NiA3My44MTMzMzRsLTY1LjcwNjY2NiAzNy45NzMzMzMgOTIuMTYgMjQuNzQ2NjY3YTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAxIDEtMjEuNzYgODIuMzQ2NjY2bC0xNzQuOTMzMzM0LTQ2LjkzMzMzM3oiIHAtaWQ9IjEzMTU0Ij48L3BhdGg+PC9zdmc+"
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">设定温度</div>
                    <div class="card-control">
                      <el-slider
                        v-model="controllerState.temperature"
                        :min="16"
                        :max="30"
                        :step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <div class="control-card temp-card">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MzQ0ODYxODUxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE4NDY4IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik02MTUuNjIyIDU4OS4wMTRWMTY1LjIyMmMwLTE3LjY3My0xNC4zMjctMzItMzItMzJINDE0LjljLTE3LjY3MyAwLTMyIDE0LjMyNy0zMiAzMnY0MjUuNjJjLTQwLjcyMyAzNC40My02NC41ODQgODUuMjA0LTY0LjU4NCAxMzguOTYyIDAgMTAwLjM1NSA4MS42NDUgMTgyIDE4MiAxODJzMTgyLTgxLjY0NSAxODItMTgyYy0wLjAwMS01NC45MjUtMjQuNjQzLTEwNi4zNjQtNjYuNjk0LTE0MC43OXogbS0xMTUuMzA3IDI1OC43OWMtNjUuMDY1IDAtMTE4LTUyLjkzNS0xMTgtMTE4IDAtMzguNTkzIDE5LjAwNS03NC44MzIgNTAuODM5LTk2Ljk0MUEzMi4wMDMgMzIuMDAzIDAgMCAwIDQ0Ni45IDYwNi41OFYxOTcuMjIyaDEwNC43MjJ2NDA3Ljg1OWEzMiAzMiAwIDAgMCAxNC4yMDIgMjYuNTk0YzMyLjg2OCAyMS45OTggNTIuNDkxIDU4LjY4MiA1Mi40OTEgOTguMTI5IDAgNjUuMDY1LTUyLjkzNCAxMTgtMTE4IDExOHoiIGZpbGw9IiIgcC1pZD0iMTg0NjkiPjwvcGF0aD48cGF0aCBkPSJNNTE2LjMxNSA2NzAuNDIzVjQ2Ni43ODVjMC04LjgzNi03LjE2NC0xNi0xNi0xNnMtMTYgNy4xNjQtMTYgMTZ2MjAzLjYzOGMtMjYuNzY1IDcuMDY5LTQ2LjUgMzEuNDM4LTQ2LjUgNjAuNDI0IDAgMzQuNTE4IDI3Ljk4MiA2Mi41IDYyLjUgNjIuNXM2Mi41LTI3Ljk4MiA2Mi41LTYyLjVjMC0yOC45ODYtMTkuNzM1LTUzLjM1NS00Ni41LTYwLjQyNHoiIGZpbGw9IiIgcC1pZD0iMTg0NzAiPjwvcGF0aD48L3N2Zz4="
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">室内温度</div>
                    <div
                      class="card-control"
                      style="
                        font-weight: 600;
                        font-size: 24px;
                        line-height: 24px;
                      "
                    >
                      {{ controllerState.temperature }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- light -->
            <template
              v-else-if="
                getIconTypeByName(
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                ) === 'light'
              "
            >
              <div class="control-cards">
                <div class="control-card power-card" style="width: 30%">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1OTI2OTE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MTY5IiBkYXRhLXNwbS1hbmNob3ItaWQ9ImEzMTN4LnNlYXJjaF9pbmRleC4wLmkxNi4yZmE4M2E4MW9RQm16TSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzg0IDE5Ni4yNjY2Njd2OTMuODY2NjY2Yy03Ni44IDQyLjY2NjY2Ny0xMjggMTI4LTEyOCAyMjEuODY2NjY3IDAgMTQwLjggMTE1LjIgMjU2IDI1NiAyNTZzMjU2LTExNS4yIDI1Ni0yNTZjMC05My44NjY2NjctNTEuMi0xNzkuMi0xMjgtMjIxLjg2NjY2N1YxOTYuMjY2NjY3YzEyMy43MzMzMzMgNTEuMiAyMTMuMzMzMzMzIDE3NC45MzMzMzMgMjEzLjMzMzMzMyAzMTUuNzMzMzMzIDAgMTg3LjczMzMzMy0xNTMuNiAzNDEuMzMzMzMzLTM0MS4zMzMzMzMgMzQxLjMzMzMzM3MtMzQxLjMzMzMzMy0xNTMuNi0zNDEuMzMzMzMzLTM0MS4zMzMzMzNjMC0xNDUuMDY2NjY3IDg5LjYtMjY0LjUzMzMzMyAyMTMuMzMzMzMzLTMxNS43MzMzMzN6IG04NS4zMzMzMzMtMjUuNmg4NS4zMzMzMzR2MjEzLjMzMzMzM2gtODUuMzMzMzM0VjE3MC42NjY2Njd6IiBmaWxsPSIjNDQ0NDQ0IiBwLWlkPSIxNDE3MCI+PC9wYXRoPjwvc3ZnPg=="
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">左侧</div>
                    <div class="card-control">
                      <el-switch
                        v-model="controllerState.switch1"
                        class="main-switch"
                      />
                    </div>
                  </div>
                </div>
                <div class="control-card power-card" style="width: 30%">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1OTI2OTE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MTY5IiBkYXRhLXNwbS1hbmNob3ItaWQ9ImEzMTN4LnNlYXJjaF9pbmRleC4wLmkxNi4yZmE4M2E4MW9RQm16TSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzg0IDE5Ni4yNjY2Njd2OTMuODY2NjY2Yy03Ni44IDQyLjY2NjY2Ny0xMjggMTI4LTEyOCAyMjEuODY2NjY3IDAgMTQwLjggMTE1LjIgMjU2IDI1NiAyNTZzMjU2LTExNS4yIDI1Ni0yNTZjMC05My44NjY2NjctNTEuMi0xNzkuMi0xMjgtMjIxLjg2NjY2N1YxOTYuMjY2NjY3YzEyMy43MzMzMzMgNTEuMiAyMTMuMzMzMzMzIDE3NC45MzMzMzMgMjEzLjMzMzMzMyAzMTUuNzMzMzMzIDAgMTg3LjczMzMzMy0xNTMuNiAzNDEuMzMzMzMzLTM0MS4zMzMzMzMgMzQxLjMzMzMzM3MtMzQxLjMzMzMzMy0xNTMuNi0zNDEuMzMzMzMzLTM0MS4zMzMzMzNjMC0xNDUuMDY2NjY3IDg5LjYtMjY0LjUzMzMzMyAyMTMuMzMzMzMzLTMxNS43MzMzMzN6IG04NS4zMzMzMzMtMjUuNmg4NS4zMzMzMzR2MjEzLjMzMzMzM2gtODUuMzMzMzM0VjE3MC42NjY2Njd6IiBmaWxsPSIjNDQ0NDQ0IiBwLWlkPSIxNDE3MCI+PC9wYXRoPjwvc3ZnPg=="
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">中间</div>
                    <div class="card-control">
                      <el-switch
                        v-model="controllerState.switch2"
                        class="main-switch"
                      />
                    </div>
                  </div>
                </div>
                <div class="control-card power-card" style="width: 30%">
                  <div class="card-icon">
                    <img
                      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU1OTI2OTE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MTY5IiBkYXRhLXNwbS1hbmNob3ItaWQ9ImEzMTN4LnNlYXJjaF9pbmRleC4wLmkxNi4yZmE4M2E4MW9RQm16TSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzg0IDE5Ni4yNjY2Njd2OTMuODY2NjY2Yy03Ni44IDQyLjY2NjY2Ny0xMjggMTI4LTEyOCAyMjEuODY2NjY3IDAgMTQwLjggMTE1LjIgMjU2IDI1NiAyNTZzMjU2LTExNS4yIDI1Ni0yNTZjMC05My44NjY2NjctNTEuMi0xNzkuMi0xMjgtMjIxLjg2NjY2N1YxOTYuMjY2NjY3YzEyMy43MzMzMzMgNTEuMiAyMTMuMzMzMzMzIDE3NC45MzMzMzMgMjEzLjMzMzMzMyAzMTUuNzMzMzMzIDAgMTg3LjczMzMzMy0xNTMuNiAzNDEuMzMzMzMzLTM0MS4zMzMzMzMgMzQxLjMzMzMzM3MtMzQxLjMzMzMzMy0xNTMuNi0zNDEuMzMzMzMzLTM0MS4zMzMzMzNjMC0xNDUuMDY2NjY3IDg5LjYtMjY0LjUzMzMzMyAyMTMuMzMzMzMzLTMxNS43MzMzMzN6IG04NS4zMzMzMzMtMjUuNmg4NS4zMzMzMzR2MjEzLjMzMzMzM2gtODUuMzMzMzM0VjE3MC42NjY2Njd6IiBmaWxsPSIjNDQ0NDQ0IiBwLWlkPSIxNDE3MCI+PC9wYXRoPjwvc3ZnPg=="
                      alt=""
                    />
                  </div>
                  <div class="card-content">
                    <div class="card-title">右侧</div>
                    <div class="card-control">
                      <el-switch
                        v-model="controllerState.switch3"
                        class="main-switch"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- humidity -->
            <template
              v-else-if="
                getIconTypeByName(
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                ) === 'humidity'
              "
            >
              <v-chart
                class="chart"
                v-if="humidityOption && humidityOption.series"
                :option="humidityOption"
                style="height: 200px; width: 600px"
              />
            </template>
            <!-- thermometer -->
            <template
              v-else-if="
                getIconTypeByName(
                  filteredDevices.find((d) => d.id === selectedDeviceId)?.name
                ) === 'thermometer'
              "
            >
              <v-chart
                class="chart"
                v-if="thermometerOption && thermometerOption.series"
                :option="thermometerOption"
                style="height: 200px; width: 600px"
              />
            </template>
            <template v-else>
              <div style="color: #888">暂无控制</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
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
  WindPower,
  // Water,
  // Thermometer,
  // Light,
  // Meter,
  // Curtain,
  // AirConditioner,
} from "@element-plus/icons-vue";
import {
  getDeviceList,
  toggleDevice as toggleDeviceApi,
  deployDevice,
  undeployDevice,
  getDeviceDetail,
  getDeviceProperties,
} from "@/api/device";
import { el } from "element-plus/es/locales.mjs";
// 温湿度图表数据
import VChart from "vue-echarts";
import * as echarts from "echarts";
import { toLowercaseSeparator } from "element-plus/es/components/watermark/src/utils.mjs";
// import { log } from "echarts/types/src/util/log.js";

const router = useRouter();

// 设备列表
const devices = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(24);

// 搜索和过滤
const searchQuery = ref("");
const statusFilter = ref("1");
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

// 引入 base64 图片 icon
const iconBase64 = {
  ac: "data:image/png;base64,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",
  thermometer:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjUxODc4MDAwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI5NDIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTcwMy41NTIgNTQ5LjI4VjE1OS40MjRjMC04My4zOTItNjguMzItMTUxLjIzMi0xNTEuNzEyLTE1MS4yMzItODMuMzYgMC0xNTEuNjggNjcuODQtMTUxLjY4IDE1MS4yMzJ2Mzg5Ljc2QzMzMS45NjggNTk3LjcyOCAyODkuMjggNjc2LjEyOCAyODkuMjggNzU4LjRjMCAxNDIuMzM2IDExNC45NDQgMjU4LjE0NCAyNTYuMTYgMjU4LjE0NCAxNDQuMDMyIDAgMjYxLjYtMTE1LjgwOCAyNjEuNi0yNTguMTQ0LTAuMDMyLTg1LjYzMi0zOC43Mi0xNjIuMzM2LTEwMy40ODgtMjA5LjEyeiBtLTE1OC4wNDggMzk1LjEzNmMtMTAxLjQwOCAwLTE4My45MzYtODMuNDU2LTE4My45MzYtMTg2LjAxNiAwLTMyLjQzMiAxMy4wMjQtNzUuNzQ0IDM1Ljk2OC0xMDYuODE2aDEzNi40OGM5Ljk1MiAwIDE4LjA0OC04Ljc2OCAxOC4wNDgtMTguNzUyIDAtOS45NTItOC4wNjQtMTguNzUyLTE4LjA0OC0xOC43NTJoLTk5Ljk2OGM2LjU5Mi01LjE1MiAxMy4xMi05LjkyIDIwLjQ0OC0xNC4yNzJsMTcuMjgtMTAuNDY0di01MC4yNzJoNjIuMjRjOS45NTIgMCAxOC4wNDgtNy4wNzIgMTguMDQ4LTE3LjA1NiAwLTkuOTUyLTguMDY0LTE3LjA1Ni0xOC4wNDgtMTcuMDU2aC02Mi4yNFYzMjcuNjhoNjIuMjRjOS45NTIgMCAxOC4wNDgtNy4wNzIgMTguMDQ4LTE3LjA1NiAwLTkuOTUyLTguMDY0LTE3LjA1Ni0xOC4wNDgtMTcuMDU2aC02Mi4yNFYyNTIuNzA0aDYyLjI0YzkuOTUyIDAgMTguMDQ4LTcuMDcyIDE4LjA0OC0xNy4wNTZzLTguMDY0LTE3LjA1Ni0xOC4wNDgtMTcuMDU2aC02Mi4yNHYtNTkuMmMwLTQzLjYxNiAzNi41MTItNzkuMTA0IDgwLjA5Ni03OS4xMDQgNDMuNjE2IDAgODAuMTI4IDM1LjQ4OCA4MC4xMjggNzkuMTA0djQyOS45MmwxNy4wODggMTAuNDY0YzU0LjcyIDMyLjQxNiA4NS44MjQgOTAuMjA4IDg1LjgyNCAxNTguNTkyLTAuMDMyIDEwMi41OTItODUuMTUyIDE4Ni4wNDgtMTg5LjQwOCAxODYuMDQ4eiIgZmlsbD0iIiBwLWlkPSIyOTQzIj48L3BhdGg+PHBhdGggZD0iTTQzMC42MjQgNzMzLjM3NmMtMy45MDQgMTMuNjMyLTYuNTYgMjUuMTUyLTYuNTYgMzguNDk2YTEyNC4xNiAxMjQuMTYgMCAwIDAgMTIzLjk2OCAxMjQuMjI0QTEyNC4yODggMTI0LjI4OCAwIDAgMCA2NzIgNzcxLjc0NGMwLTEzLjM0NC0yLjY1Ni0yNC43MDQtNi41Ni0zOC4zNjhoLTIzNC44MTZ6IiBmaWxsPSIiIHAtaWQ9IjI5NDQiPjwvcGF0aD48L3N2Zz4=",
  light:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjUxOTAzNjc1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQyODkiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTUxMiAwaC0wLjdDMjk4LjcgMC40IDEyNi4yIDE3NC44IDEyOCAzODcuNGMxIDExMi4xIDUwIDIxMi44IDEyNy41IDI4Mi40IDUxIDQ1LjggODAuNSAxMTAuOCA4MC41IDE3OS4zdjU3YzAgNjUuMSA1Mi44IDExNy45IDExNy45IDExNy45aDExNi4yYzY1LjEgMCAxMTcuOS01Mi44IDExNy45LTExNy45di01N2MwLTY4LjYgMjkuNi0xMzMuNiA4MC42LTE3OS41Qzg0Ni44IDU5OS4zIDg5NiA0OTcuNCA4OTYgMzg0IDg5NiAxNzEuOSA3MjQuMSAwIDUxMiAweiBtMjEzLjkgNjIyQzY2MS4xIDY4MC4zIDYyNCA3NjMgNjI0IDg0OS4xVjg5NmMwIDM1LjMtMjguNyA2NC02NCA2NGgtOTZjLTM1LjMgMC02NC0yOC43LTY0LTY0di00Ni45YzAtODYuMS0zNy4xLTE2OC45LTEwMS43LTIyNy0zMi44LTI5LjQtNTguNy02NC42LTc3LjEtMTA0LjQtMTktNDEuMi0yOC44LTg1LjItMjkuMi0xMzAuOS0wLjQtNDMuMyA3LjgtODUuNCAyNC4zLTEyNS4xIDE2LTM4LjQgMzktNzIuOSA2OC40LTEwMi43IDI5LjQtMjkuNyA2My43LTUzLjEgMTAxLjktNjkuNSAzOS41LTE2LjkgODEuNS0yNS41IDEyNC44LTI1LjZoMC42YzQzLjIgMCA4NS4xIDguNSAxMjQuNSAyNS4xIDM4LjEgMTYuMSA3Mi4zIDM5LjIgMTAxLjcgNjguNiAyOS40IDI5LjQgNTIuNSA2My42IDY4LjYgMTAxLjdDODIzLjYgMjk4LjkgODMyIDM0MC44IDgzMiAzODRjMCA0Ni4yLTkuNiA5MC44LTI4LjYgMTMyLjVDNzg1IDU1Ni44IDc1OSA1OTIuMyA3MjUuOSA2MjJ6IiBwLWlkPSI0MjkwIj48L3BhdGg+PHBhdGggZD0iTTUxNi43IDYyNGwxOS40LTE3My4zSDQ2MEw2MjcuMyAyMDhsLTE5LjQgMTczLjNINjg0TDUxNi43IDYyNHpNNTc2IDkxMkg0NDhgLTQuNCAwLTguNC0xLjgtMTEuMy00LjctMi45LTIuOS00LjctNi45LTQuNy0xMS4zIDAtOC44IDcuMi0xNiAxNi0xNmgxMjhjNC40IDAgOC40IDEuOCAxMS4zIDQuNyAyLjkgMi45IDQuNyA2LjkgNC43IDExLjMgMCA4LjgtNy4yIDE2LTE2IDE2eiBtMC02NEg0NDhgLTQuNCAwLTguNC0xLjgtMTEuMy00LjctMi45LTIuOS00LjctNi45LTQuNy0xMS4zIDAtOC44IDcuMi0xNiAxNi0xNmgxMjhjNC40IDAgOC40IDEuOCAxMS4zIDQuNyAyLjkgMi45IDQuNyA2LjkgNC43IDExLjMgMCA4LjgtNy4yIDE2LTE2IDE2eiBtMTYtNjRINDMyYy00LjQgMC04LjQtMS44LTExLjMtNC43LTIuOS0yLjktNC43LTYuOS00LjctMTEuMyAwLTguOCA3LjItMTYgMTYtMTZoMTYwYzQuNCAwIDguNCAxLjggMTEuMyA0LjcgMi45IDIuOSA0LjcgNi45IDQuNyAxMS4zIDAgOC44LTcuMiAxNi0xNiAxNnoiIHAtaWQ9IjQyOTEiPjwvcGF0aD48L3N2Zz4=",
  humidity:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjUxOTMxNjI3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjYzMzEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTY4Mi42NjY2NjcgNzMzLjg2NjY2N2M0LjI2NjY2Ny00LjI2NjY2NyAxMi44LTguNTMzMzMzIDIxLjMzMzMzMy04LjUzMzMzNCA0Mi42NjY2NjcgMCA1NS40NjY2NjcgNDYuOTMzMzMzIDEwMi40IDEyLjgtNC4yNjY2NjctMjUuNi0yNS42LTc2LjgtNjQtMTQ1LjA2NjY2Ni0zNC4xMzMzMzMgNjQtNTUuNDY2NjY3IDExNS4yLTU5LjczMzMzMyAxNDAuOHogbS0zMzIuOC0xMjMuNzMzMzM0bDI2NC41MzMzMzMtMjY0LjUzMzMzM2M4LjUzMzMzMy04LjUzMzMzMyAyMS4zMzMzMzMtOC41MzMzMzMgMjkuODY2NjY3IDBzOC41MzMzMzMgMjEuMzMzMzMzIDAgMjkuODY2NjY3TDM3OS43MzMzMzMgNjQwYzQuMjY2NjY3IDguNTMzMzMzIDQuMjY2NjY3IDE3LjA2NjY2NyA0LjI2NjY2NyAyNS42IDAgMzQuMTMzMzMzLTI5Ljg2NjY2NyA2NC02NCA2NFMyNTYgNjk5LjczMzMzMyAyNTYgNjY1LjZzMjkuODY2NjY3LTY0IDY0LTY0YzEyLjggMCAyMS4zMzMzMzMgNC4yNjY2NjcgMjkuODY2NjY3IDguNTMzMzMzeiBtLTEyLjgtNDYuOTMzMzMzaC0xNy4wNjY2NjdjLTU5LjczMzMzMyAwLTEwNi42NjY2NjcgNDYuOTMzMzMzLTEwNi42NjY2NjcgMTAyLjRDMjEzLjMzMzMzMyA3MjUuMzMzMzMzIDI2MC4yNjY2NjcgNzY4IDMyMCA3NjhzMTA2LjY2NjY2Ny00Mi42NjY2NjcgMTA2LjY2NjY2Ny0xMDIuNHYtOC41MzMzMzNsMzM3LjA2NjY2Ni0zMzcuMDY2NjY3YzI1LjYtMjUuNiAyNS42LTY0IDAtODkuNi0yNS42LTI1LjYtNjQtMjUuNi04OS42IDBsLTMzNy4wNjY2NjYgMzMyLjh6IG0tMTcuMDY2NjY3LTQyLjY2NjY2N0w2NDAgMjAwLjUzMzMzM2M0Mi42NjY2NjctNDIuNjY2NjY3IDExMC45MzMzMzMtNDIuNjY2NjY3IDE0OS4zMzMzMzMgMHM0Mi42NjY2NjcgMTEwLjkzMzMzMyAwIDE0OS4zMzMzMzRMNDY5LjMzMzMzMyA2NjkuODY2NjY3Yy00LjI2NjY2NyA4MS4wNjY2NjctNjguMjY2NjY3IDE0MC44LTE0OS4zMzMzMzMgMTQwLjhTMTcwLjY2NjY2NyA3NDYuNjY2NjY3IDE3MC42NjY2NjcgNjY1LjZzNjguMjY2NjY3LTE0NS4wNjY2NjcgMTQ5LjMzMzMzMy0xNDUuMDY2NjY3eiBtNDI2LjY2NjY2NyAzMzIuOGMtNTkuNzMzMzMzIDAtMTA2LjY2NjY2Ny00Ni45MzMzMzMtMTA2LjY2NjY2Ny0xMDYuNjY2NjY2IDAtMzguNCAzNC4xMzMzMzMtMTE1LjIgMTA2LjY2NjY2Ny0yMjYuMTMzMzM0IDcyLjUzMzMzMyAxMTAuOTMzMzMzIDEwNi42NjY2NjcgMTg3LjczMzMzMyAxMDYuNjY2NjY2IDIyNi4xMzMzMzQgMCA1OS43MzMzMzMtNDYuOTMzMzMzIDEwNi42NjY2NjctMTA2LjY2NjY2NiAxMDYuNjY2NjY2eiIgZmlsbD0iIzQ0NDQ0NCIgcC1pZD0iNjMzMiI+PC9wYXRoPjwvc3ZnPg==",
  curtain:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjUxOTgwNjMwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwNTMgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijc4NDYiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjA1LjY2NDA2MjUiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMTAyMi4zNjg5MSAwSDMyLjE5MDQ1N2EzMi4xOTA0NTcgMzIuMTkwNDU3IDAgMCAwLTMyLjE5MDQ1NyAzMi4xOTA0NTd2OTIwLjY0NzA2NmMzLjg2Mjg1NSA4LjA0NzYxNCA2MS40ODM3NzMgMTI2LjE4NjU5MSAxODEuODc2MDgxIDM5LjU5NDI2MmEzNC43NjU2OTMgMzQuNzY1NjkzIDAgMCAxIDQ3Ljk2Mzc4MSA5LjY1NzEzNyAzOS4yNzIzNTcgMzkuMjcyMzU3IDAgMCAwIDQ5LjU3MzMwMyA5LjY1NzEzNyA0MS4yMDM3ODUgNDEuMjAzNzg1IDAgMCAwIDIwLjYwMTg5My0yNS4xMDg1NTdWMTAwLjQzNDIyNWg0NTMuODg1NDQxdjg4Ny40OTA4OTZhNDAuODgxODggNDAuODgxODggMCAwIDAgMTkuOTU4MDg0IDI1LjEwODU1NiAzOC45NTA0NTMgMzguOTUwNDUzIDAgMCAwIDQ5LjI1MTM5OS05LjY1NzEzNyAzNS4wODc1OTggMzUuMDg3NTk4IDAgMCAxIDQ3Ljk2Mzc4LTExLjU4ODU2NGMxMjAuNzE0MjEzIDg2LjU5MjMyOSAxNzguNjU3MDM2LTMyLjE5MDQ1NyAxODEuODc2MDgyLTM5LjU5NDI2MlYzMi4xOTA0NTdhMzIuMTkwNDU3IDMyLjE5MDQ1NyAwIDAgMC0zMi4xOTA0NTctMzIuMTkwNDU3ek0xMjMuNjExMzU0IDk0Ni4zOTk0MzFjLTI5LjI5MzMxNiA0OC4yODU2ODUtNTQuNDAxODcyIDAtNTQuNDAxODcyIDBWOTkuNzkwNDE2aDU0LjQwMTg3MnogbTEwNi41NTA0MTItMy4yMTkwNDVhNDguOTI5NDk0IDQ4LjkyOTQ5NCAwIDAgMC02MC44Mzk5NjMgMFYxMDAuMTEyMzIxaDYwLjgzOTk2M1Y5NDMuMTgwMzg2eiBtNjUwLjU2OTEzMyAwYTQ4LjkyOTQ5NCA0OC45Mjk0OTQgMCAwIDAtNjAuODM5OTYzIDBWMTAwLjExMjMyMWg2MS44MDU2NzdWOTQzLjE4MDM4NnogbTk4LjgyNDcwMyAzLjIxOTA0NXMtMjQuNDY0NzQ3IDQ4LjI4NTY4NS01NC40MDE4NzIgMFY5OS43OTA0MTZoNTQuNDAxODcyeiIgZmlsbD0iIzJjMmMyYyIgcC1pZD0iNzg0NyI+PC9wYXRoPjwvc3ZnPg==",
  electricMeter:
    "data:image/png;base64,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",
  unmatched:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ4MjU0NjA3NzMyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEwMTc2IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik05MzguNjY2NjY3IDg1LjMzMzMzM3Y4NTMuMzMzMzM0SDg1LjMzMzMzM1Y4NS4zMzMzMzNoODUzLjMzMzMzNHpNNTEyIDU0Mi4xNjUzMzNMMTU4LjE2NTMzMyA4OTZoNzA3LjY5MDY2N0w1MTIuMDIxMzMzIDU0Mi4xNjUzMzN6TTg5NiAxNTguMTQ0TDU0Mi4xODY2NjcgNTExLjk3ODY2NyA4OTYgODY1LjgzNDY2N1YxNTguMTQ0ek0xMjggMTU4LjE2NTMzM3Y3MDcuNjQ4bDM1My44MzQ2NjctMzUzLjgzNDY2NkwxMjggMTU4LjE2NTMzM3pNODY1LjgxMzMzMyAxMjhIMTU4LjE2NTMzM2wzNTMuODU2IDM1My44MTMzMzNMODY1LjgxMzMzMyAxMjh6IiBmaWxsPSIjMmMyYzJjIiBwLWlkPSIxMDE3NyI+PC9wYXRoPjwvc3ZnPg==",
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

// 根据设备名称获取图标类型
const getIconTypeByName = (name) => {
  if (!name) return null;
  if (name.includes("空调")) return "ac";
  if (name.includes("温度")) return "thermometer";
  if (name.includes("湿度")) return "humidity";
  if (name.includes("灯")) return "light";
  if (name.includes("窗帘")) return "curtain";
  if (name.includes("电表")) return "electricMeter";
  return "unmatched";
};

// 根据设备类型获取图标
const getDeviceIcon = (type) => {
  // 需要渲染图片的类型
  const imgTypes = [
    "ac",
    "thermometer",
    "light",
    "humidity",
    "curtain",
    "electricMeter",
    "unmatched",
  ];
  if (imgTypes.includes(type)) {
    return `<img src='${iconBase64[type]}' alt='' style='width:32px;height:32px;vertical-align:middle;' />`;
  }
  // 其他类型用原有 icon
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
  router.push(`/devices/${device.id}/edit`);
};

// 跳转到设备详情
const goToDeviceDetail = (deviceId) => {
  // router.push(`/devices/${deviceId}`);
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

const selectedDeviceId = ref(null);

// 控制器状态
const controllerState = reactive({
  switch1: false,
  switch2: false,
  switch3: false,
  childLock: false,
  fanSpeed: "low", // 1-3
  temperature: 26, // Add temperature control
  curtainOpen: false, // 窗帘开关
  curtainPercent: 0, // 窗帘百分比
  workMode: "cool",
  setpoint: 25,
});

let lastCardRect = null;

// 进入控制器模式
const showController = (device, event) => {
  selectedDeviceId.value = device.id;
  // 获取卡片初始位置
  const cardEl = event?.currentTarget;
  if (cardEl) {
    const rect = cardEl.getBoundingClientRect();
    lastCardRect = rect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // 计算中心点
    const targetLeft = vw / 2 - 200;
    const targetTop = vh / 2 - 160;
    floatCardStyle.value = {
      position: "fixed",
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
      margin: 0,
      transform: "none",
      transition: "all 0.38s cubic-bezier(.5,1.8,.5,1)",
    };
    setTimeout(() => {
      floatCardStyle.value = {
        position: "fixed",
        left: targetLeft + "px",
        top: targetTop + "px",
        width: "650px",
        height: "fit-content",
        margin: 0,
        transform: "none",
        transition: "all 0.2s cubic-bezier(0.00, 0.00, 0.30, 0.90)",
      };
    }, 20);
  }
  controllerState.switch = false;
  controllerState.childLock = false;
  controllerState.fanSpeed = 1;

  // 新增：点击时判断类型并获取图表数据
  const type = getIconTypeByName(device.name);
  if (type === "thermometer") {
    fetchThermometerData(device.id);
  } else if (type === "humidity") {
    fetchHumidityData(device.id);
  } else if (type === "light") {
    // 获取灯光设备数据
    fetchDeviceData(device.id);
  } else if (type === "ac") {
    // 获取空调设备数据
    fetchDeviceData(device.id);
  } else if (type === "curtain") {
    // 获取窗帘设备数据
    fetchDeviceData(device.id);
  }
};

// 关闭控制器，带反向动画
const closeController = () => {
  if (lastCardRect) {
    const rect = lastCardRect;
    floatCardStyle.value = {
      position: "fixed",
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
      margin: 0,
      transform: "none",
      transition: "all 0.2s cubic-bezier(0.00, 0.00, 0.30, 0.90)",
    };
    setTimeout(() => {
      selectedDeviceId.value = null;
      floatCardStyle.value = {};
      lastCardRect = null;
    }, 200);
  } else {
    selectedDeviceId.value = null;
    floatCardStyle.value = {};
    lastCardRect = null;
  }
};

// 控制器操作
const handleSwitch = (val) => {
  controllerState.switch = val;
};
const handleChildLock = (val) => {
  controllerState.childLock = val;
};
const handleFanSpeed = (val) => {
  controllerState.fanSpeed = val;
};

// 点击遮罩空白退出
const onOverlayClick = (e) => {
  if (e.target === overlayRef.value) {
    closeController();
  }
};

onMounted(() => {
  // 加载设备列表
  loadDevices();
});

const overlayRef = ref(null);
const floatCardRef = ref(null);
const floatCardStyle = ref({});

const thermometerOption = ref({});
const humidityOption = ref({});

// 格式化时间戳为HH:mm
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts));
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// 获取温度历史数据并渲染图表
async function fetchThermometerData(deviceId) {
  try {
    const res = await getDeviceProperties(deviceId, "value");
    console.log("res", res);

    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      const sorted = [...res.result.data].sort(
        (a, b) => (a.timestamp || a.createTime) - (b.timestamp || b.createTime)
      );
      const recent = sorted.slice(-25);
      const data = recent.map((item) => ({
        time: formatTime(item.timestamp || item.createTime),
        value: item.value,
      }));
      thermometerOption.value = {
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: data.map((d) => d.time),
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
            interval: 1,
            hideOverlap: false,
          },
          axisLine: { lineStyle: { color: "#409eff", width: 2 } },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
          },
          name: "°C",
          nameTextStyle: { fontSize: 18, color: "#409eff", fontWeight: 700 },
          splitLine: { lineStyle: { color: "#eee", type: "dashed" } },
        },
        series: [
          {
            data: data.map((d) => d.value),
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: { color: "#ff9900", width: 4 },
            itemStyle: {
              color: "#ff9900",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: { color: "rgba(255,153,0,0.10)" },
          },
        ],
        grid: { left: 30, right: 20, top: 35, bottom: 50 },
      };
    }
  } catch (e) {
    thermometerOption.value = {};
  }
}

// 获取湿度历史数据并渲染图表
async function fetchHumidityData(deviceId) {
  try {
    const res = await getDeviceProperties(deviceId, "value");
    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      const sorted = [...res.result.data].sort(
        (a, b) => (a.timestamp || a.createTime) - (b.timestamp || b.createTime)
      );
      const recent = sorted.slice(-25);
      const data = recent.map((item) => ({
        time: formatTime(item.timestamp || item.createTime),
        value: item.value,
      }));
      humidityOption.value = {
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: data.map((d) => d.time),
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 45,
            interval: 1,
            hideOverlap: false,
          },
          axisLine: { lineStyle: { color: "#409eff", width: 2 } },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#222",
            fontSize: 16,
            fontWeight: 600,
            rotate: 30,
          },
          name: "%",
          nameTextStyle: {
            fontSize: 18,
            color: "#409eff",
            fontWeight: 700,
            top: "100%",
          },
          splitLine: { lineStyle: { color: "#eee", type: "dashed" } },
        },
        series: [
          {
            data: data.map((d) => d.value),
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: { color: "#409eff", width: 4 },
            itemStyle: {
              color: "#409eff",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: { color: "rgba(64,158,255,0.10)" },
          },
        ],
        grid: { left: 30, right: 20, top: 35, bottom: 50 },
      };
      console.log("humidityOption.value", humidityOption.value);
    }
  } catch (e) {
    humidityOption.value = {};
  }
}

// fetchDeviceData
async function fetchDeviceData(deviceId) {
  try {
    const ref = await getDeviceDetail(deviceId);
    const metadata = JSON.parse(ref.result.metadata);
    const ids = metadata.properties.map((item) => item.id);
    const res = await getDeviceProperties(deviceId, ids);

    if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
      // Sort by timestamp in descending order (newest first)
      const sorted = [...res.result.data].sort(
        (a, b) => (b.timestamp || b.createTime) - (a.timestamp || a.createTime)
      );

      if (ref.result.accessName === "light") {
        // Get the latest state for each position (left, center, right)
        const latestStates = {
          left: sorted.find((item) => item.property === "state_left"),
          center: sorted.find((item) => item.property === "state_center"),
          right: sorted.find((item) => item.property === "state_right"),
        };

        controllerState.switch1 =
          latestStates.left.value === "OFF" ? false : true;
        controllerState.switch2 =
          latestStates.center.value === "OFF" ? false : true;
        controllerState.switch3 =
          latestStates.right.value === "OFF" ? false : true;
      } else if (ref.result.accessName === "ac") {
        // Get the latest state for each position (
        const latestStates = {
          power: sorted.find((item) => item.property === "power_on"),
          fanMode: sorted.find((item) => item.property === "fan_mode"),
          childLock: sorted.find((item) => item.property === "child_lock"),
          temperature: sorted.find(
            (item) => item.property === "local_temperature"
          ),
          setpoint: sorted.find(
            (item) => item.property === "current_heating_setpoint"
          ),
          systemMode: sorted.find((item) => item.property === "system_mode"),
        };
        console.log("latestStates", latestStates);

        controllerState.switch1 = latestStates.power.value;
        controllerState.fanSpeed = latestStates.fanMode.value;
        controllerState.childLock =
          latestStates.childLock?.value === "UNLOCK" ? false : true;
        controllerState.setpoint = latestStates.setpoint.value;
        controllerState.temperature = latestStates.temperature.value;
        controllerState.workMode = latestStates.systemMode.value;
      } else if (ref.result.accessName === "curtaintest-lysen") {
        // Get the latest state for each position (
        const latestStates = {
          position: sorted.find((item) => item.property === "position"),
        };
        console.log("latestStates", latestStates);
        controllerState.curtainPercent = latestStates.position.value;
        //如果状态为0，则打开，否则关闭
        controllerState.curtainOpen =
          latestStates.position.value === 0 ? true : false;
      }

      console.log("Latest states:", latestStates);
    }
  } catch (e) {
    console.log("e", e);
  }
}
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
  border-radius: 16px;
  border: none;
  background: var(--glass-bg, rgba(255, 255, 255, 0.18));
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.device-offline {
  opacity: 0.7;
  background: #fafafa;
}

.device-info-only {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}

.device-name {
  font-size: 24px;
  font-weight: 700;
  color: #222;
}

.device-status {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
}

.status-online {
  background-color: #aff7b5;
  color: #ffffff;
}

.status-offline {
  background: #f4f4f5;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.device-icon-img {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
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

.controller-overlay {
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 30, 30, 0.38);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.controller-float-card {
  width: fit-content;
  height: fit-content;
  margin: 0px;
  transform: none;
  padding: 20px;
  /* 动画由 style 绑定控制 */
  background: var(--glass-bg, rgba(255, 255, 255, 0.22));
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  overflow: hidden;
}

.controller-header {
  display: flex;
  padding: 10px 20px;
}

.controller-header .device-name {
  margin-left: 20px;
}

.controller-icon {
  margin-bottom: 24px;
}

.controller-icon img {
  width: 64px !important;
  height: 64px !important;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 4px 0;
}

.status-dot.status-online {
  background-color: #67c23a;
}

.status-dot.status-offline {
  background-color: #f56c6c;
}

.main-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.control-label {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.main-switch {
  transform: scale(1.5);
}

.secondary-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.fan-speed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.device-status {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  color: #747474;
}

.control-cards {
  display: flex;
  width: 650px;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.control-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  transition: all 0.3s ease;
  width: 300px;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-icon img {
  width: 70%;
  height: 70%;
}

.power-card .card-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.lock-card .card-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.fan-card .card-icon {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}
.mode-card .card-icon {
  background: rgba(230, 162, 60, 0.1);
  color: #3c78e6;
}

.temp-card .card-icon {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.card-control {
  display: flex;
  align-items: center;
}

.temp-card .card-control {
  width: 100%;
}

.temp-card .el-slider {
  margin: 0;
}

.fan-speed-btn {
  min-width: 80px;
  background: #f5f7fa;
  border: none;
  color: #606266;
  font-weight: 500;
}

.fan-speed-btn:hover {
  background: #e4e7ed;
  color: #303133;
}

.curtain-switch-btn {
  min-width: 100px;
  height: 36px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}
.curtain-switch-btn.el-button--primary {
  background: #67c23a;
  border-color: #67c23a;
  color: #fff;
}
.curtain-switch-btn.el-button--default {
  background: #f0f2f5;
  border-color: #e4e7ed;
  color: #303133;
}
.curtain-slider {
  width: 100%;
}
.curtain-slider :deep(.el-slider__runway) {
  height: 6px;
}
.curtain-slider :deep(.el-slider__bar) {
  height: 6px;
  background-color: #409eff;
}
.curtain-slider :deep(.el-slider__button) {
  width: 16px;
  height: 16px;
  border: 2px solid #409eff;
}
</style>
