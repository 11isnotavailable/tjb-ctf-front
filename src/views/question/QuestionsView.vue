<template>
  <div class="questions-page">
    <!-- 背景动画 -->
    <MatrixRainCanvas :color="matrixColor" :background-color="matrixBackground" :speed="matrixSpeed" :density="matrixDensity" />

    <!-- 主体区域 -->
    <div class="main-area">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">训练</div>
          <ul class="sidebar-list">
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'Web' }" 
              @click="filterByTag('Web')"
            >Web | 网络攻防</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'Crypto' }" 
              @click="filterByTag('Crypto')"
            >Crypto | 密码学</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'Reverse' }" 
              @click="filterByTag('Reverse')"
            >Reverse | 逆向工程</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'Pwn' }" 
              @click="filterByTag('Pwn')"
            >Pwn | 二进制安全</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'AWD' }" 
              @click="filterByTag('AWD')"
            >AWD | 攻防模式</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedTag === 'AI' }" 
              @click="filterByTag('AI')"
            >AI | 人工智能安全</li>
          </ul>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">赛事</div>
          <ul class="sidebar-list">
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'MoeCTF' }" 
              @click="filterByEvent('MoeCTF')"
            >MoeCTF 2025</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'Mini L-CTF' }" 
              @click="filterByEvent('Mini L-CTF')"
            >Mini L-CTF 2025</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'TGCTF' }" 
              @click="filterByEvent('TGCTF')"
            >TGCTF 2025</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'NPC²CTF' }" 
              @click="filterByEvent('NPC²CTF')"
            >NPC²CTF 2025</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'NewYear CTF' }" 
              @click="filterByEvent('NewYear CTF')"
            >NewYear CTF 2025</li>
            <li 
              class="sidebar-item" 
              :class="{ active: selectedEvent === 'NewStar CTF' }" 
              @click="filterByEvent('NewStar CTF')"
            >NewStar CTF 2024</li>
          </ul>
        </div>
      </aside>
      
      <!-- 右侧内容区 -->
      <section class="content-area">
        <!-- 搜索和筛选区域 -->
        <div class="filter-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题目"
            prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-input"
          />
          <el-button 
            type="primary" 
            plain 
            :class="{ 'active-filter': !selectedTag && !selectedEvent }" 
            @click="clearFilters"
          >
            全部题目
          </el-button>
          <el-select v-model="difficulty" placeholder="难度筛选" clearable @change="handleDifficultyChange">
            <el-option v-for="n in 5" :key="n" :label="`${n}星`" :value="n" />
          </el-select>
        </div>

        <el-table 
          v-if="!loading" 
          :data="questions" 
          style="width: 100%" 
          @row-click="row => gotoDetail(row.question_id)"
          :empty-text="loading ? '加载中...' : '没有找到匹配的题目'"
        >
          <el-table-column prop="title" label="题目标题" min-width="180" />
          <el-table-column prop="introduction" label="简介" min-width="220">
            <template #default="scope">
              <span>{{ scope.row.introduction.length > 40 ? scope.row.introduction.slice(0, 40) + '...' : scope.row.introduction }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="star" label="难度" width="100">
            <template #default="scope">
              <el-rate v-model="scope.row.star" disabled show-score text-color="#ff9900" score-template="{value}" />
            </template>
          </el-table-column>
          <el-table-column prop="try_number" label="尝试" width="80" />
          <el-table-column prop="solved_number" label="解决" width="80" />
          <el-table-column prop="create_time" label="创建时间" width="140">
            <template #default="scope">
              <span>{{ scope.row.create_time.split('T')[0] }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="is_active" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.is_active ? 'success' : 'info'">{{ scope.row.is_active ? '激活' : '未激活' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-else class="empty-state">
          <el-skeleton :rows="8" animated />
        </div>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import MatrixRainCanvas from '@/components/effects/MatrixRainCanvas.vue';
import { useThemeStore } from '@/stores/theme';
import { getQuestionList, QuestionItem } from '@/api/question';
import { useRouter } from 'vue-router';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const themeStore = useThemeStore();
const matrixColor = themeStore.themeConfig.matrixColor;
const matrixBackground = themeStore.themeConfig.matrixBackgroundColor;
const matrixSpeed = themeStore.themeConfig.matrixSpeed;
const matrixDensity = themeStore.themeConfig.matrixDensity;

// 题目数据与分页
const allQuestions = ref<QuestionItem[]>([]); // 所有题目数据
const questions = ref<QuestionItem[]>([]); // 当前显示的题目数据
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 筛选
const selectedTag = ref('');
const selectedEvent = ref('');
const searchKeyword = ref('');
const difficulty = ref();

const router = useRouter();

// 清理题目数据，处理后端数据类型不一致问题
const cleanQuestionData = (questions: QuestionItem[]): QuestionItem[] => {
  return questions.map(question => ({
    ...question,
    // 如果topology是字符串，转换为null或空对象
    topology: typeof question.topology === 'string' ? null : question.topology
  }));
};

// 获取所有题目数据
const fetchAllQuestions = async () => {
  loading.value = true;
  try {
    // 获取第一页来了解总数
    const firstPageResponse = await getQuestionList({ page: 1, page_size: 100 });
    
    if (firstPageResponse.code === 200) {
      // 清理数据格式
      allQuestions.value = cleanQuestionData(firstPageResponse.data.items);
      applyFiltersAndPagination();
    } else {
      ElMessage.error(firstPageResponse.message || '获取题目列表失败');
      allQuestions.value = [];
      questions.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取题目列表失败:', error);
    ElMessage.error('获取题目列表失败，请稍后再试');
    allQuestions.value = [];
    questions.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 应用筛选和分页
const applyFiltersAndPagination = () => {
  let filteredQuestions = [...allQuestions.value];

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filteredQuestions = filteredQuestions.filter(q => 
      q.title.toLowerCase().includes(keyword) || 
      q.introduction.toLowerCase().includes(keyword)
    );
  }

  // 按难度筛选
  if (difficulty.value) {
    filteredQuestions = filteredQuestions.filter(q => q.star === difficulty.value);
  }

  // 按标签筛选 (这里可以根据实际需求添加标签字段)
  if (selectedTag.value) {
    // 假设题目标题或介绍中包含标签信息
    filteredQuestions = filteredQuestions.filter(q => 
      q.title.toLowerCase().includes(selectedTag.value.toLowerCase()) ||
      q.introduction.toLowerCase().includes(selectedTag.value.toLowerCase())
    );
  }

  // 按赛事筛选 (这里可以根据实际需求添加赛事字段)
  if (selectedEvent.value) {
    filteredQuestions = filteredQuestions.filter(q => 
      q.title.toLowerCase().includes(selectedEvent.value.toLowerCase()) ||
      q.introduction.toLowerCase().includes(selectedEvent.value.toLowerCase())
    );
  }

  // 计算总数
  total.value = filteredQuestions.length;

  // 分页
  const startIndex = (page.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  questions.value = filteredQuestions.slice(startIndex, endIndex);
};

// 按标签筛选
const filterByTag = (tag: string) => {
  if (selectedTag.value === tag) {
    // 取消选中
    selectedTag.value = '';
  } else {
    selectedTag.value = tag;
    selectedEvent.value = ''; // 清除赛事筛选
  }
  page.value = 1; // 重置分页
  applyFiltersAndPagination();
};

// 按赛事筛选
const filterByEvent = (event: string) => {
  if (selectedEvent.value === event) {
    // 取消选中
    selectedEvent.value = '';
  } else {
    selectedEvent.value = event;
    selectedTag.value = ''; // 清除标签筛选
  }
  page.value = 1; // 重置分页
  applyFiltersAndPagination();
};

// 清除所有筛选条件
const clearFilters = () => {
  selectedTag.value = '';
  selectedEvent.value = '';
  difficulty.value = undefined;
  searchKeyword.value = '';
  page.value = 1;
  applyFiltersAndPagination();
};

// 搜索处理
const handleSearch = () => {
  page.value = 1;
  applyFiltersAndPagination();
};

// 难度筛选
const handleDifficultyChange = () => {
  page.value = 1;
  applyFiltersAndPagination();
};

// 分页处理
const handlePageChange = (val: number) => {
  page.value = val;
  applyFiltersAndPagination();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  page.value = 1;
  applyFiltersAndPagination();
};

// 跳转到题目详情
const gotoDetail = (id: number) => {
  router.push(`/home/questions/${id}`);
};

// 监听URL参数变化
watch(() => router.currentRoute.value.query, (query) => {
  const { tag, event, keyword, star, page: pageQuery, pageSize: pageSizeQuery } = query;
  
  if (tag) selectedTag.value = tag as string;
  if (event) selectedEvent.value = event as string;
  if (keyword) searchKeyword.value = keyword as string;
  if (star) difficulty.value = parseInt(star as string);
  if (pageQuery) page.value = parseInt(pageQuery as string);
  if (pageSizeQuery) pageSize.value = parseInt(pageSizeQuery as string);
  
  if (allQuestions.value.length > 0) {
    applyFiltersAndPagination();
  } else {
    fetchAllQuestions();
  }
}, { immediate: true });

onMounted(fetchAllQuestions);
</script>

<style scoped>
.questions-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.main-area {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
  position: relative;
  z-index: 1;
}

.sidebar {
  width: 260px;
  background: rgba(255,255,255,0.85);
  border-right: 1px solid #eee;
  padding: 40px 0 0 0;
  min-height: calc(100vh - 60px);
  box-shadow: 2px 0 8px 0 rgba(0,0,0,0.03);
  position: relative;
  z-index: 2;
}

.sidebar-section {
  margin-bottom: 40px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 32px;
  margin-bottom: 10px;
}

.sidebar-list {
  list-style: none;
  padding: 0 0 0 32px;
  margin: 0;
}

.sidebar-item {
  font-size: 15px;
  color: #222;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.sidebar-item:hover {
  background: #f5f7fa;
}

.sidebar-item.active {
  color: var(--el-color-primary);
  font-weight: bold;
}

.content-area {
  flex: 1;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.active-filter {
  background-color: var(--el-color-primary) !important;
  color: white !important;
  border-color: var(--el-color-primary) !important;
}

.empty-state {
  width: 100%;
  text-align: center;
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .main-area {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid #eee;
    box-shadow: none;
    padding: 20px 0 0 0;
  }
  
  .content-area {
    padding: 30px 10px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>
