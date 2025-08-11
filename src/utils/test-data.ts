// 测试数据，用于开发阶段验证功能
export const mockQuestionDetail = {
  question_id: 1,
  user_id: 1,
  title: "Web漏洞挖掘入门",
  introduction: "这是一道Web安全入门题目，主要考察SQL注入和XSS漏洞的发现与利用。\n\n**学习目标：**\n- 理解SQL注入原理\n- 掌握XSS攻击手段\n- 学会使用安全工具\n\n**提示：**\n观察网站的登录功能，尝试构造特殊的输入",
  is_active: true,
  flag_prefix: "flag{",
  topology: {
    title: "Web应用拓扑",
    nodes: [
      { id: "user", label: "攻击者", icon: "user" },
      { id: "web", label: "Web服务器", icon: "server" },
      { id: "db", label: "数据库", icon: "database" },
      { id: "firewall", label: "防火墙", icon: "firewall" }
    ],
    connections: [
      { from: "user", to: "firewall" },
      { from: "firewall", to: "web", bidirectional: true },
      { from: "web", to: "db" }
    ],
    direction: "LR"
  },
  valid_time: 3600,
  create_time: "2025-01-15T10:30:00",
  star: 3,
  try_number: 156,
  solved_number: 89
};

export const mockContainerInfo = {
  docker_id: 1001,
  access: "http://ctf-web-1001.example.com",
  status: "RUNNING" as const,
  create_time: "2025-01-15T14:20:00",
  timeout: 3600,
  refresh_count: 0,
  type: "DYNAMIC" as const,
  local_port: "8080",
  question_id: 1,
  user_id: 1
};

export const mockSubmitRecords = [
  {
    record_id: 1,
    user_id: 1,
    question_id: 1,
    tag_id: 1,
    ip: "192.168.1.100",
    provided: "flag{sql_injection_master}",
    correction: true,
    create_time: "2025-01-15T15:30:00",
    rank: 12
  },
  {
    record_id: 2,
    user_id: 1,
    question_id: 1,
    tag_id: 1,
    ip: "192.168.1.100",
    provided: "flag{wrong_answer}",
    correction: false,
    create_time: "2025-01-15T15:25:00"
  },
  {
    record_id: 3,
    user_id: 1,
    question_id: 1,
    tag_id: 1,
    ip: "192.168.1.100",
    provided: "flag{test_flag}",
    correction: false,
    create_time: "2025-01-15T15:20:00"
  }
];

// 模拟API响应格式
export const createMockApiResponse = <T>(data: T, message = "操作成功") => ({
  code: 200,
  data,
  message
});

// 拓扑图测试数据
export const mockTopologyData = {
  title: "企业网络安全拓扑",
  nodes: [
    { id: "internet", label: "互联网", icon: "internet" },
    { id: "firewall", label: "边界防火墙", icon: "firewall" },
    { id: "dmz_web", label: "DMZ Web服务器", icon: "server" },
    { id: "internal_db", label: "内网数据库", icon: "server" },
    { id: "admin", label: "管理员", icon: "user" },
    { id: "switch", label: "核心交换机", icon: "switch" }
  ],
  connections: [
    { from: "internet", to: "firewall", color: "#e74c3c" },
    { from: "firewall", to: "dmz_web", bidirectional: true, color: "#f39c12" },
    { from: "firewall", to: "switch", color: "#27ae60" },
    { from: "switch", to: "internal_db", color: "#3498db" },
    { from: "admin", to: "switch", bidirectional: true, color: "#9b59b6", style: "dashed" }
  ],
  direction: "TB"
};