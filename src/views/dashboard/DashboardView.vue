<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 左侧菜单 -->
      <el-col :span="5">
        <el-menu
          :default-active="activeMenu"
          class="dashboard-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><DataLine /></el-icon>
            <span>概览</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="questions">
            <el-icon><Document /></el-icon>
            <span>题目管理</span>
          </el-menu-item>
          <el-menu-item index="environments">
            <el-icon><Monitor /></el-icon>
            <span>环境管理</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      
      <!-- 右侧内容区域 -->
      <el-col :span="19">
        <!-- 概览 -->
        <div v-if="activeMenu === 'overview'" class="dashboard-section">
          <h2 class="section-title">系统概览</h2>
          
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-icon user-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.userCount }}</div>
                  <div class="stat-label">用户数</div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-icon question-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.questionCount }}</div>
                  <div class="stat-label">题目数</div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-icon env-icon">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.activeEnvCount }}</div>
                  <div class="stat-label">活跃环境</div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-icon solve-icon">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.solvedCount }}</div>
                  <div class="stat-label">解题提交</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <div class="chart-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="chart-card">
                  <template #header>
                    <div class="card-header">
                      <span>用户注册趋势</span>
                    </div>
                  </template>
                  <div class="chart-placeholder">
                    <!-- 实际项目中这里可以使用ECharts等图表库 -->
                    <p class="chart-msg">用户注册趋势图表</p>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card class="chart-card">
                  <template #header>
                    <div class="card-header">
                      <span>题目解决统计</span>
                    </div>
                  </template>
                  <div class="chart-placeholder">
                    <!-- 实际项目中这里可以使用ECharts等图表库 -->
                    <p class="chart-msg">题目解决统计图表</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <!-- 用户管理 -->
        <div v-else-if="activeMenu === 'users'" class="dashboard-section">
          <div class="section-header">
            <h2 class="section-title">用户管理</h2>
            <div class="section-actions">
              <el-input
                v-model="userSearch"
                placeholder="搜索用户"
                prefix-icon="Search"
                clearable
                @input="handleUserSearch"
                class="search-input"
              />
              <el-button type="primary" @click="exportUserData">导出数据</el-button>
            </div>
          </div>
          
          <el-table
            :data="users"
            style="width: 100%"
            v-loading="loadingUsers"
            border
          >
            <el-table-column prop="user_id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" min-width="150" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column prop="register_time" label="注册时间" width="180" />
            <el-table-column prop="is_admin" label="角色" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.is_admin ? 'danger' : ''">
                  {{ scope.row.is_admin ? '管理员' : '用户' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="editUser(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  :type="scope.row.is_admin ? '' : 'success'"
                  size="small"
                  @click="toggleUserRole(scope.row)"
                >
                  {{ scope.row.is_admin ? '取消管理员' : '设为管理员' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="userPage.current"
              v-model:page-size="userPage.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="userPage.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserSizeChange"
              @current-change="handleUserCurrentChange"
            />
          </div>
        </div>
        
        <!-- 题目管理 -->
        <div v-else-if="activeMenu === 'questions'" class="dashboard-section">
          <div class="section-header">
            <h2 class="section-title">题目管理</h2>
            <div class="section-actions">
              <el-input
                v-model="questionSearch"
                placeholder="搜索题目"
                prefix-icon="Search"
                clearable
                @input="handleQuestionSearch"
                class="search-input"
              />
              <el-button type="primary" @click="createQuestion">新建题目</el-button>
            </div>
          </div>
          
          <el-table
            :data="questions"
            style="width: 100%"
            v-loading="loadingQuestions"
            border
          >
            <el-table-column prop="question_id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="tag" label="分类" width="120">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.tag }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="star" label="难度" width="120">
              <template #default="scope">
                <el-rate
                  v-model="scope.row.star"
                  disabled
                  text-color="#ff9900"
                />
              </template>
            </el-table-column>
            <el-table-column prop="is_active" label="状态" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.is_active"
                  @change="toggleQuestionStatus(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="editQuestion(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="deleteQuestion(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="questionPage.current"
              v-model:page-size="questionPage.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="questionPage.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleQuestionSizeChange"
              @current-change="handleQuestionCurrentChange"
            />
          </div>
        </div>
        
        <!-- 环境管理 -->
        <div v-else-if="activeMenu === 'environments'" class="dashboard-section">
          <div class="section-header">
            <h2 class="section-title">环境管理</h2>
            <div class="section-actions">
              <el-input
                v-model="envSearch"
                placeholder="搜索环境"
                prefix-icon="Search"
                clearable
                @input="handleEnvSearch"
                class="search-input"
              />
              <el-button type="danger" @click="batchDestroy">批量销毁</el-button>
            </div>
          </div>
          
          <el-table
            :data="environments"
            style="width: 100%"
            v-loading="loadingEnvs"
            @selection-change="handleEnvSelection"
            border
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="environment_id" label="ID" width="80" />
            <el-table-column prop="question_title" label="题目" min-width="180" />
            <el-table-column prop="username" label="用户" width="150" />
            <el-table-column prop="connect_ip" label="IP地址" width="120" />
            <el-table-column prop="port" label="端口" width="80" />
            <el-table-column prop="create_at" label="创建时间" width="180" />
            <el-table-column prop="activate_status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.activate_status ? 'success' : 'info'">
                  {{ scope.row.activate_status ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="restartEnvironment(scope.row)"
                  :disabled="scope.row.activate_status"
                >
                  重启
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="destroyEnvironment(scope.row)"
                >
                  销毁
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="envPage.current"
              v-model:page-size="envPage.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="envPage.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleEnvSizeChange"
              @current-change="handleEnvCurrentChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  DataLine,
  User,
  Document,
  Monitor,
  Check,
  Search
} from '@element-plus/icons-vue';

const activeMenu = ref('overview');

// 系统统计数据
const stats = reactive({
  userCount: 0,
  questionCount: 0,
  activeEnvCount: 0,
  solvedCount: 0
});

// 用户管理
const users = ref<any[]>([]);
const loadingUsers = ref(false);
const userSearch = ref('');
const userPage = reactive({
  current: 1,
  size: 10,
  total: 0
});
const selectedEnvs = ref<any[]>([]);

// 题目管理
const questions = ref<any[]>([]);
const loadingQuestions = ref(false);
const questionSearch = ref('');
const questionPage = reactive({
  current: 1,
  size: 10,
  total: 0
});

// 环境管理
const environments = ref<any[]>([]);
const loadingEnvs = ref(false);
const envSearch = ref('');
const envPage = reactive({
  current: 1,
  size: 10,
  total: 0
});

// 菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
  
  switch (key) {
    case 'overview':
      fetchStats();
      break;
    case 'users':
      fetchUsers();
      break;
    case 'questions':
      fetchQuestions();
      break;
    case 'environments':
      fetchEnvironments();
      break;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    // 实际项目中应当使用API请求
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟请求延迟
    
    // 模拟数据
    stats.userCount = 156;
    stats.questionCount = 32;
    stats.activeEnvCount = 48;
    stats.solvedCount = 2475;
  } catch (error) {
    ElMessage.error('获取统计数据失败');
    console.error(error);
  }
};

// 获取用户列表
const fetchUsers = async () => {
  loadingUsers.value = true;
  
  try {
    // 实际项目中应当使用API请求
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟请求延迟
    
    // 模拟数据
    const mockUsers = [
      {
        user_id: 1,
        username: 'admin',
        email: 'admin@example.com',
        register_time: '2025-06-01 10:00:00',
        is_admin: true
      },
      {
        user_id: 2,
        username: 'test_user',
        email: 'test@example.com',
        register_time: '2025-06-10 15:30:00',
        is_admin: false
      },
      {
        user_id: 3,
        username: 'john_doe',
        email: 'john@example.com',
        register_time: '2025-06-15 09:45:00',
        is_admin: false
      }
    ];
    
    users.value = mockUsers;
    userPage.total = mockUsers.length;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  } finally {
    loadingUsers.value = false;
  }
};

// 获取题目列表
const fetchQuestions = async () => {
  loadingQuestions.value = true;
  
  try {
    // 实际项目中应当使用API请求
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟请求延迟
    
    // 模拟数据
    const mockQuestions = [
      {
        question_id: 1,
        title: 'SQL注入基础挑战',
        tag: 'Web',
        star: 2,
        is_active: true
      },
      {
        question_id: 2,
        title: 'Buffer溢出入门',
        tag: 'Pwn',
        star: 3,
        is_active: true
      },
      {
        question_id: 3,
        title: 'XSS跨站脚本攻击',
        tag: 'Web',
        star: 2,
        is_active: false
      }
    ];
    
    questions.value = mockQuestions;
    questionPage.total = mockQuestions.length;
  } catch (error) {
    ElMessage.error('获取题目列表失败');
    console.error(error);
  } finally {
    loadingQuestions.value = false;
  }
};

// 获取环境列表
const fetchEnvironments = async () => {
  loadingEnvs.value = true;
  
  try {
    // 实际项目中应当使用API请求
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟请求延迟
    
    // 模拟数据
    const mockEnvironments = [
      {
        environment_id: 1,
        question_id: 1,
        question_title: 'SQL注入基础挑战',
        username: 'test_user',
        connect_ip: '192.168.1.10',
        port: 8080,
        create_at: '2025-07-20 15:30:00',
        activate_status: 1
      },
      {
        environment_id: 2,
        question_id: 2,
        question_title: 'Buffer溢出入门',
        username: 'john_doe',
        connect_ip: '192.168.1.11',
        port: 8081,
        create_at: '2025-07-20 16:45:00',
        activate_status: 1
      },
      {
        environment_id: 3,
        question_id: 3,
        question_title: 'XSS跨站脚本攻击',
        username: 'test_user',
        connect_ip: '192.168.1.12',
        port: 8082,
        create_at: '2025-07-19 10:15:00',
        activate_status: 0
      }
    ];
    
    environments.value = mockEnvironments;
    envPage.total = mockEnvironments.length;
  } catch (error) {
    ElMessage.error('获取环境列表失败');
    console.error(error);
  } finally {
    loadingEnvs.value = false;
  }
};

// 用户相关操作
const handleUserSearch = () => {
  fetchUsers();
};

const handleUserSizeChange = (size: number) => {
  userPage.size = size;
  fetchUsers();
};

const handleUserCurrentChange = (current: number) => {
  userPage.current = current;
  fetchUsers();
};

const editUser = (user: any) => {
  ElMessage.info(`编辑用户: ${user.username}`);
};

const toggleUserRole = (user: any) => {
  const action = user.is_admin ? '取消' : '设置为';
  
  ElMessageBox.confirm(
    `确定要${action}${user.username}的管理员权限吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应当使用API请求
    user.is_admin = !user.is_admin;
    ElMessage.success(`已${action}管理员`);
  }).catch(() => {
    // 取消操作
  });
};

const exportUserData = () => {
  ElMessage.success('用户数据导出中...');
};

// 题目相关操作
const handleQuestionSearch = () => {
  fetchQuestions();
};

const handleQuestionSizeChange = (size: number) => {
  questionPage.size = size;
  fetchQuestions();
};

const handleQuestionCurrentChange = (current: number) => {
  questionPage.current = current;
  fetchQuestions();
};

const createQuestion = () => {
  ElMessage.info('创建新题目');
};

const editQuestion = (question: any) => {
  ElMessage.info(`编辑题目: ${question.title}`);
};

const toggleQuestionStatus = (question: any) => {
  const status = question.is_active ? '启用' : '禁用';
  ElMessage.success(`已${status}题目: ${question.title}`);
};

const deleteQuestion = (question: any) => {
  ElMessageBox.confirm(
    `确定要删除题目 "${question.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应当使用API请求
    questions.value = questions.value.filter(q => q.question_id !== question.question_id);
    questionPage.total--;
    ElMessage.success('删除成功');
  }).catch(() => {
    // 取消操作
  });
};

// 环境相关操作
const handleEnvSearch = () => {
  fetchEnvironments();
};

const handleEnvSizeChange = (size: number) => {
  envPage.size = size;
  fetchEnvironments();
};

const handleEnvCurrentChange = (current: number) => {
  envPage.current = current;
  fetchEnvironments();
};

const handleEnvSelection = (selection: any[]) => {
  selectedEnvs.value = selection;
};

const restartEnvironment = (env: any) => {
  ElMessage.success(`重启环境: ID ${env.environment_id}`);
  env.activate_status = 1;
};

const destroyEnvironment = (env: any) => {
  ElMessageBox.confirm(
    `确定要销毁环境 ID: ${env.environment_id} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应当使用API请求
    environments.value = environments.value.filter(e => e.environment_id !== env.environment_id);
    envPage.total--;
    ElMessage.success('环境已销毁');
  }).catch(() => {
    // 取消操作
  });
};

const batchDestroy = () => {
  if (selectedEnvs.value.length === 0) {
    ElMessage.warning('请先选择要销毁的环境');
    return;
  }
  
  const count = selectedEnvs.value.length;
  
  ElMessageBox.confirm(
    `确定要销毁选中的 ${count} 个环境吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应当使用API请求
    const ids = selectedEnvs.value.map(env => env.environment_id);
    environments.value = environments.value.filter(env => !ids.includes(env.environment_id));
    envPage.total -= count;
    ElMessage.success(`已销毁 ${count} 个环境`);
  }).catch(() => {
    // 取消操作
  });
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 120px);
  display: flex;
}

.dashboard-menu {
  height: 100%;
  border-radius: 4px;
}

.dashboard-section {
  padding: 0 0 20px 20px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.stat-card {
  display: flex;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
}

.stat-icon {
  font-size: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.user-icon {
  background-color: #409EFF;
}

.question-icon {
  background-color: #67C23A;
}

.env-icon {
  background-color: #E6A23C;
}

.solve-icon {
  background-color: #F56C6C;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-section {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chart-msg {
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 