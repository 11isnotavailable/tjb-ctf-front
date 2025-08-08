<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧用户信息卡片 -->
      <el-col :span="6">
        <el-card class="user-card">
          <div class="user-avatar">
            <el-avatar :size="100" :src="userAvatar">
              {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
          </div>
          
          <div class="user-info">
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="email">{{ userInfo.email }}</p>
            <p class="join-date">注册时间: {{ formatDate(userInfo.register_time) }}</p>
          </div>
          
          <el-divider />
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalSolved || 0 }}</div>
              <div class="stat-label">总解题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalSuccessSolved || 0 }}</div>
              <div class="stat-label">正确解题</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalScore || 0 }}</div>
              <div class="stat-label">总分</div>
            </div>
          </div>
          
          <el-divider />
          
          <!-- 分析报告按钮 -->
          <div class="report-section">
            <el-button 
              type="success" 
              size="large"
              :loading="isDownloading"
              :disabled="!hasAnyRecords"
              @click="handleDownloadReport"
              class="report-btn"
            >
              <el-icon><Document /></el-icon>
              获取分析报告
            </el-button>
            <p class="report-tip" v-if="hasAnyRecords">下载详细的个人能力分析报告</p>
            <p class="report-tip warning" v-else>请先完成题目再尝试生成报告</p>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧内容区域 -->
      <el-col :span="18">
        <el-tabs v-model="activeTab">
          <!-- 基本设置 -->
          <el-tab-pane label="基本设置" name="settings">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>个人资料</span>
                </div>
              </template>
              
              <el-form 
                ref="formRef"
                :model="form"
                label-width="100px"
                :rules="rules"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>
                
                <el-form-item label="电子邮箱">
                  <el-input v-model="userInfo.email" disabled />
                  <div class="form-tip">邮箱不可修改</div>
                </el-form-item>
                
                <el-form-item label="个人签名" prop="signature">
                  <el-input
                    v-model="form.signature"
                    type="textarea"
                    placeholder="请输入个人签名"
                    maxlength="200"
                    show-word-limit
                    :rows="3"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="updateProfile" :loading="updating">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
            
            <el-card class="mt-20">
              <template #header>
                <div class="card-header">
                  <span>修改密码</span>
                </div>
              </template>
              
              <el-form 
                ref="passwordFormRef"
                :model="passwordForm"
                label-width="100px"
                :rules="passwordRules"
              >
                <el-form-item label="当前密码" prop="currentPassword">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                  <div class="form-tip">
                    密码必须包含至少一个小写字母、一个大写字母、一个数字和一个特殊字符，且长度至少为8个字符
                  </div>
                </el-form-item>
                
                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请确认新密码"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="updatePassword" :loading="updatingPassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <!-- 解题记录 -->
          <el-tab-pane label="解题记录" name="records">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>解题记录</span>
                </div>
              </template>
              
              <!-- 添加图表区域 -->
              <!-- 有数据时显示图表 -->
              <div class="stats-dashboard" v-show="!loadingRecords && records.length > 0">
                <div class="chart-row">
                  <div class="chart-container">
                    <div v-if="hasAnyCategoryData" id="categoryChart" class="chart"></div>
                    <div v-else class="empty-chart">
                      <el-empty description="暂无题目分类数据" />
                    </div>
                  </div>
                  <div class="chart-container">
                    <div v-if="hasTrendData" id="trendChart" class="chart"></div>
                    <div v-else class="empty-chart">
                      <el-empty description="暂无解题趋势数据" />
                    </div>
                  </div>
                  <div class="chart-container">
                    <div v-if="hasSkillData" id="skillRadarChart" class="chart"></div>
                    <div v-else class="empty-chart">
                      <el-empty description="暂无技能雷达数据，开始解题后即可查看能力分析" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 无记录时显示友好提示 -->
              <div v-show="!loadingRecords && records.length === 0" class="no-records-placeholder">
                <el-empty description="当前尚未有解题记录">
                  <template #image>
                    <el-icon :size="100" color="#409eff">
                      <Document />
                    </el-icon>
                  </template>
                  <el-button type="primary" @click="$router.push('/home/questions')">开始刷题</el-button>
                </el-empty>
              </div>
              
              <el-table
                :data="records"
                style="width: 100%"
                v-loading="loadingRecords"
              >
                <el-table-column prop="question_title" label="题目" min-width="200" />
                <el-table-column prop="tag" label="分类" width="120">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.tag }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="difficulty" label="难度" width="120">
                  <template #default="scope">
                    <el-rate
                      v-model="scope.row.difficulty"
                      disabled
                      text-color="#ff9900"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="correction" label="状态" width="120">
                  <template #default="scope">
                    <el-tag :type="scope.row.correction === 1 ? 'success' : 'danger'">
                      {{ scope.row.correction === 1 ? '已解决' : '答案错误' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="submit_time" label="提交时间" width="180" />
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="goToQuestion(scope.row.question_id)"
                    >
                      查看题目
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { validateFormField } from '@/utils/validator';
import type { FormInstance, FormRules } from 'element-plus';
import { updateUserInfo, updateUserPassword, getUserStats, getUserRecords, getEvaluationReport } from '@/api/user';
// 引入 echarts
import * as echarts from 'echarts/core';
import { PieChart, RadarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([
  PieChart,
  RadarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
  CanvasRenderer
]);

const router = useRouter();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 用户头像（如果后续接口提供，可从userInfo中获取）
const userAvatar = ref('');

// 活动标签页
const activeTab = ref('records');

// 下载分析报告状态
const isDownloading = ref(false);

// 完整的统计数据
const fullStatsData = ref<any>(null);

// 检查是否有数据的计算属性
const hasAnyCategoryData = computed(() => {
  const data = getCategoryData();
  return data.some(item => item.value > 0);
});

const hasTrendData = computed(() => {
  const data = getSolvedTrendData();
  return data.some(value => value > 0);
});

const hasSkillData = computed(() => {
  const data = getSkillRadarData();
  return data.some(value => value > 0);
});

// 检查用户是否有任何做题记录
const hasAnyRecords = computed(() => {
  // 检查总解题数是否大于0，或者records数组中是否有数据
  return userStats.totalSolved > 0 || records.value.length > 0;
});

// 个人资料表单
const formRef = ref<FormInstance>();
const form = reactive({
  username: '',
  signature: ''
});
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符之间', trigger: 'blur' }
  ],
  signature: [
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ]
});
const updating = ref(false);

// 修改密码表单
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};
const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: (_, value, callback) => {
      const result = validateFormField('password', value);
      if (result === true) {
        callback();
      } else {
        callback(new Error(result as string));
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
});
const updatingPassword = ref(false);

// 解题记录
const records = ref<any[]>([]);
const loadingRecords = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const userStats = reactive({
  totalSolved: 0,
  totalSuccessSolved: 0,
  totalScore: 0
});

// 图表实例
let categoryChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;
let skillRadarChart: echarts.ECharts | null = null;

// 图表相关方法
const initCharts = () => {
  // 如果activeTab不是records，不初始化图表
  if (activeTab.value !== 'records') return;
  
  // 使用 nextTick 确保DOM完全渲染
  nextTick(() => {
    setTimeout(() => {
      // 分类统计饼图 - 只在有数据时初始化
      if (hasAnyCategoryData.value) {
        const categoryElement = document.getElementById('categoryChart');
        if (!categoryChart && categoryElement && categoryElement.offsetWidth > 0 && categoryElement.offsetHeight > 0) {
          categoryChart = echarts.init(categoryElement);
          const categoryData = getCategoryData();
          
          categoryChart.setOption({
            title: {
              text: '题目类型分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: ['Web安全', '密码学', '取证分析', '系统安全', '恶意软件']
            },
            series: [
              {
                name: '解题数量',
                type: 'pie',
                radius: '60%',
                center: ['50%', '60%'],
                data: categoryData,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          });
        }
      }
    
      // 解题趋势折线图 - 只在有数据时初始化
      if (hasTrendData.value) {
        const trendElement = document.getElementById('trendChart');
        if (!trendChart && trendElement && trendElement.offsetWidth > 0 && trendElement.offsetHeight > 0) {
          trendChart = echarts.init(trendElement);
          const trendData = getSolvedTrendData();
          
          trendChart.setOption({
            title: {
              text: '解题趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              data: getLast7Days()
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: trendData,
                type: 'line',
                smooth: true,
                name: '解题数',
                color: '#67C23A'
              }
            ]
          });
        }
      }
    
      // 技能雷达图 - 只在有数据时初始化
      if (hasSkillData.value) {
        const radarElement = document.getElementById('skillRadarChart');
        if (!skillRadarChart && radarElement && radarElement.offsetWidth > 0 && radarElement.offsetHeight > 0) {
          skillRadarChart = echarts.init(radarElement);
          const radarData = getSkillRadarData();
          
          skillRadarChart.setOption({
            title: {
              text: '技能分布',
              left: 'center'
            },
            radar: {
              indicator: [
                { name: 'Web安全', max: 100 },
                { name: '逆向工程', max: 100 },
                { name: '密码学', max: 100 },
                { name: '二进制', max: 100 },
                { name: '取证分析', max: 100 }
              ]
            },
            series: [
              {
                name: '技能雷达',
                type: 'radar',
                data: [
                  {
                    value: radarData,
                    name: '能力值',
                    areaStyle: {
                      color: 'rgba(64, 158, 255, 0.3)'
                    }
                  }
                ]
              }
            ]
          });
        }
      }
    }, 300); // 给DOM一点时间渲染
  });
};

// 更新图表
const updateCharts = () => {
  if (categoryChart) {
    const categoryData = getCategoryData();
    const hasData = categoryData.some(item => item.value > 0);
    
    categoryChart.setOption({
      graphic: {
        style: {
          text: hasData ? '' : '暂无解题记录'
        },
        invisible: hasData
      },
      series: [
        {
          data: categoryData
        }
      ]
    });
  }
  
  if (trendChart) {
    const trendData = getSolvedTrendData();
    const hasData = trendData.some(val => val > 0);
    
    trendChart.setOption({
      graphic: {
        style: {
          text: hasData ? '' : '暂无解题记录'
        },
        invisible: hasData
      },
      series: [
        {
          data: trendData
        }
      ]
    });
  }
  
  if (skillRadarChart) {
    const radarData = getSkillRadarData();
    const hasData = radarData.some(val => val > 0);
    
    skillRadarChart.setOption({
      graphic: {
        style: {
          text: hasData ? '' : '暂无技能数据'
        },
        invisible: hasData
      },
      series: [
        {
          data: [
            {
              value: radarData
            }
          ]
        }
      ]
    });
  }
};

// 获取分类数据
const getCategoryData = () => {
  if (!fullStatsData.value?.tag_stats) {
    // 如果没有数据，返回默认的空数据结构
    return [
      { name: 'Web安全', value: 0 },
      { name: '密码学', value: 0 },
      { name: '取证分析', value: 0 },
      { name: '系统安全', value: 0 },
      { name: '恶意软件', value: 0 }
    ];
  }
  
  const tagStats = fullStatsData.value.tag_stats;
  const categoryMapping: Record<string, string> = {
    'pentest': 'Web安全',
    'crypto': '密码学',
    'forensics': '取证分析',
    'system': '系统安全',
    'malware': '恶意软件'
  };
  
  // 显示所有分类，即使解题数为0
  return Object.keys(tagStats).map(key => ({
    name: categoryMapping[key] || key,
    value: tagStats[key].solved || 0
  }));
};

// 获取最近7天日期
const getLast7Days = () => {
  if (!fullStatsData.value?.daily_stats) {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    return dates;
  }
  
  return fullStatsData.value.daily_stats.map((day: any) => {
    const date = new Date(day.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
};

// 获取解题趋势数据
const getSolvedTrendData = () => {
  if (!fullStatsData.value?.daily_stats) {
    return new Array(7).fill(0);
  }
  
  const dailyStats = fullStatsData.value.daily_stats;
  return dailyStats.map((day: any) => day.solved_count || 0);
};

// 获取技能雷达图数据
const getSkillRadarData = () => {
  if (!fullStatsData.value?.skill_scores) {
    return [0, 0, 0, 0, 0];
  }
  
  const skillScores = fullStatsData.value.skill_scores;
  return [
    skillScores.pentest || 0,    // Web安全
    skillScores.system || 0,     // 逆向工程  
    skillScores.crypto || 0,     // 密码学
    skillScores.malware || 0,    // 二进制
    skillScores.forensics || 0   // 取证分析
  ];
};

// 窗口调整大小处理
const handleResize = () => {
  categoryChart?.resize();
  trendChart?.resize();
  skillRadarChart?.resize();
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    console.log('开始获取用户统计数据, user_id:', userInfo.value.user_id);
    const response = await getUserStats(userInfo.value.user_id);
    console.log('getUserStats响应:', response);
    
    if (response.code === 200) {
      console.log('统计数据获取成功:', response.data);
      const statsData = response.data;
      userStats.totalSolved = statsData.total_attempts || 0; // 总解题次数
      userStats.totalSuccessSolved = statsData.total_solved || 0; // 正确解题数
      userStats.totalScore = statsData.total_score || 0;
      
      // 存储完整的统计数据供图表使用
      fullStatsData.value = statsData;
      
      console.log('解析后的用户统计:', {
        totalSolved: userStats.totalSolved,
        totalSuccessSolved: userStats.totalSuccessSolved,
        totalScore: userStats.totalScore
      });
      
      // 如果当前在records标签页，初始化图表（即使没有记录数据也显示空图表）
      if (activeTab.value === 'records') {
        initCharts();
      }
    } else {
      console.error('统计数据响应错误:', response);
      ElMessage.error(response.message || '获取用户统计数据失败');
    }
  } catch (error) {
    console.error('获取用户统计数据异常:', error);
    ElMessage.error('获取用户统计数据失败');
  }
};

// 获取解题记录
const fetchRecords = async () => {
  loadingRecords.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    };
    
    console.log('开始获取解题记录, user_id:', userInfo.value.user_id, 'params:', params);
    const response = await getUserRecords(userInfo.value.user_id, params);
    console.log('getUserRecords响应:', response);
    
    if (response.code === 200) {
      console.log('解题记录获取成功:', response.data);
      const recordsData = response.data;
      records.value = recordsData.items || []; // 使用 items 而不是 records
      total.value = recordsData.total || 0;

      console.log('解析后的记录数据:', {
        records: records.value,
        total: total.value
      });

      // 数据加载完成后初始化图表（即使没有记录数据也显示空图表）
      if (activeTab.value === 'records' && fullStatsData.value) {
        initCharts();
      }
    } else {
      console.error('记录数据响应错误:', response);
      ElMessage.error(response.message || '获取解题记录失败');
    }
  } catch (error) {
    console.error('获取解题记录异常:', error);
    ElMessage.error('获取解题记录失败');
  } finally {
    loadingRecords.value = false;
  }
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchRecords();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchRecords();
};

// 更新个人资料
const updateProfile = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      updating.value = true;
      try {
        // 调用后端接口
        await updateUserInfo({
          username: form.username
        });
        ElMessage.success('个人资料更新成功');
        // 刷新用户信息
        await userStore.getUserInfoAction();
      } catch (error) {
        // 错误提示已由 request 拦截器处理
      } finally {
        updating.value = false;
      }
    }
  });
};

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      updatingPassword.value = true;
      try {
        // 调用后端接口
        await updateUserPassword({
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        });
        ElMessage.success('密码修改成功');
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
      } catch (error) {
        // 错误提示已由 request 拦截器处理
      } finally {
        updatingPassword.value = false;
      }
    }
  });
};

// 跳转到题目详情
const goToQuestion = (questionId: number) => {
  router.push(`/questions/${questionId}`);
};

// 下载分析报告
const handleDownloadReport = async () => {
  try {
    isDownloading.value = true;
    
    const response = await getEvaluationReport();
    
    // 由于响应拦截器的修改，现在response是原始的axios响应对象
    // response.data是Blob对象
    const blob = response.data;
    
    // 检查是否确实是一个有效的blob
    if (!(blob instanceof Blob)) {
      throw new Error('响应数据不是有效的文件格式');
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 设置文件名（带时间戳）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `个人能力分析报告_${userInfo.value.username}_${timestamp}.docx`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('分析报告下载成功');
  } catch (error: any) {
    console.error('下载分析报告失败:', error);
    
    // 更详细的错误处理
    let errorMessage = '下载分析报告失败';
    if (error.response?.status === 404) {
      errorMessage = '报告生成失败，请稍后重试';
    } else if (error.response?.status >= 500) {
      errorMessage = '服务器错误，请稍后重试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ElMessage.error(errorMessage);
  } finally {
    isDownloading.value = false;
  }
};

// 监听标签页切换
watch(() => activeTab.value, (newVal) => {
  if (newVal === 'records') {
    // 延时确保DOM渲染完成
    setTimeout(() => {
      initCharts();
    }, 100);
  }
});

// 监听记录变化
watch(() => records.value, () => {
  if (activeTab.value === 'records' && !loadingRecords.value) {
    updateCharts();
  }
}, { deep: true });

onMounted(async () => {
  // 初始化表单数据
  form.username = userInfo.value.username || '';
  form.signature = ''; // 假设后端暂未提供签名字段
  
  // 先加载统计数据，再加载记录数据
  await fetchUserStats();
  await fetchRecords();
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 组件卸载前销毁图表实例
  categoryChart?.dispose();
  trendChart?.dispose();
  skillRadarChart?.dispose();
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.user-card {
  text-align: center;
}

.user-avatar {
  margin: 20px 0;
}

.username {
  margin: 10px 0;
  font-size: 20px;
}

.email {
  color: #909399;
  margin-bottom: 5px;
}

.join-date {
  color: #909399;
  font-size: 13px;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}

.report-section {
  margin-top: 20px;
  text-align: center;
}

.report-btn {
  width: 100%;
  height: 45px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.report-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.report-tip {
  margin: 10px 0 0 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.report-tip.warning {
  color: #f56565;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.mt-20 {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 图表相关样式 */
.stats-dashboard {
  margin-bottom: 20px;
}

.chart-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-container {
  flex: 1;
  min-width: 300px;
  height: 280px;
}

.chart {
  width: 100%;
  height: 100%;
}

.empty-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-records-placeholder {
  padding: 40px;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-container {
    min-width: 100%;
  }
}
</style> 