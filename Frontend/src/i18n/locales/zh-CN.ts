// ============================================================
// 文件: i18n/locales/zh-CN.ts
// 说明: 中文语言包
//       所有中文文案集中管理在此文件中
//       拓展方式：新增页面时在此文件对应位置添加文案即可
// ============================================================

// 导出中文语言包对象
export default {
  // --- 通用 ---
  common: {
    home: '首页',
    articles: '技术文章',
    categories: '技术专栏',
    about: '关于作者',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    loadMore: '加载更多',
    viewCount: '阅读',
    publishedAt: '发布于',
  },

  // --- 导航菜单 ---
  nav: {
    embeddedLinux: '嵌入式Linux',
    hardwareDesign: '硬件电路设计',
    mcuDevelopment: '单片机开发',
    hotArticles: '热门文章',
    latestArticles: '最新文章',
    writeArticle: '写文章',
  },

  // --- 首页 ---
  homePage: {
    title: '开源熊猫',
    subtitle: '嵌入式与硬件开发技术交流平台',
    description: '嵌入式Linux、硬件电路设计、单片机开发、FPGA开发等技术交流与学习平台，分享技术文章、项目实战经验和开发技巧',
    hotArticles: '热门文章',
    latestArticles: '最新文章',
  },

  // --- 文章 ---
  article: {
    detail: '文章详情',
    list: '文章列表',
    tags: '标签',
    category: '分类',
    relatedArticles: '相关文章',
    backToList: '返回列表',
    searchPlaceholder: '搜索技术文章...',
    searchResult: '搜索结果',
    noSearchResult: '未找到相关文章',
  },

  // --- 分类 ---
  category: {
    embeddedLinux: '嵌入式Linux',
    embeddedLinuxDesc: 'Linux环境搭建、驱动开发、系统移植实操记录',
    hardwareDesign: '硬件电路设计',
    hardwareDesignDesc: '原理图设计、PCB布局、硬件调试技巧',
    mcuDevelopment: '单片机开发',
    mcuDevelopmentDesc: 'STM32、ESP32等单片机开发教程与项目实战',
  },

  // --- 关于 ---
  about: {
    name: '罗钦文',
    phone: '19985813415',
    email: 'clinton_luo@163.com',
    githubUrl: 'https://github.com/clint456',
    site: 'clintonluo.com',
    siteUrl: 'https://www.clintonluo.com',
    workTitle: '工作经历',
    work1: {
      role: '嵌入式软件开发工程师',
      org: '四川汇源光通信（变电物联网产品线）· 在职',
      status: '在职',
      points: [
        '主导 RK3568/RK3576 两代硬件平台迭代，完成内核适配、驱动开发、系统定制与整机 EMC 验证',
        '负责 EdgeX 协议解析微服务开发，统一内部通信规范并输出接口文档供上游 Web 团队集成',
        '规约标准化：北向 MQTT/Modbus/IEC104，南向 Modbus/LoRa/BLE/GPS/IEC104/定制 MQTT',
        '基于 NRSEC3000 国密芯片开发加密代理，实现 MQTT 端到端加密传输',
        '自研调试工具支撑现场部署与协议一致性测试；推进接入节点量产及汇聚节点中试交付',
      ],
    },
    work2: {
      role: '嵌入式软件开发工程师',
      org: '浙江大学湖州研究院 · 海洋机器人研究中心',
      date: '2024.02 - 2024.09',
      desc: '反无人机船载激光打击系统核心开发，统筹视觉算法、TensorRT 边缘推理加速、Qt6 上位机全链路开发与跨设备联调，负责硬件选型与方案论证。',
    },
    work3: {
      role: '信息技术 / 科创实习教师',
      org: '贵州省实验中学',
      date: '2023.08 - 2024.01',
      desc: '负责机器人及编程科创社团教学，开展嵌入式与机器视觉实训，指导学生完成机器人竞赛备赛与大创项目开发。',
    },
    projectsTitle: '项目经历',
    projects: [
      {
        name: '电力物联网边缘网关系列产品',
        date: '2025.03 - 至今',
        stack: 'Linux · C/C++ · Golang · EdgeX Foundry · Docker · RK3568/RK3576 · Modbus · MQTT · LoRa · IEC104 · IEC61850 · 国密加密',
        points: [
          '完成 RK 系列平台设备树开发、内核裁剪、外设驱动编写（4G/WiFi/LoRa/NVMe/ADC/看门狗）',
          '基于 EdgeX MessageBus 独立开发 GPS/BLE/Modbus/LoRa/IEC104 南向采集微服务',
          '基于国密芯片开发加密代理微服务，搭建标准化电力物模型，实现南北向协议互通',
          '完成 OpenEuler 系统移植与 IEC61850 协议栈微服务预研，规划变电站一体化软件方案',
        ],
      },
      {
        name: '反无人机激光打击一体化船载系统',
        date: '2024.02 - 2024.08',
        stack: 'Python · C++ · OpenCV · YOLOv8 · DeepSORT · TensorRT · Qt6 · Jetson Xavier NX',
        points: [
          '自建数据集训练 YOLOv8 + DeepSORT + 卡尔曼滤波多目标跟踪，TensorRT 量化加速满足实时性',
          'Qt6 多线程上位机：UDP 多路图像传输、RS485 云台控制、激光校准与可视化交互',
        ],
      },
      {
        name: 'RoboMaster 对抗机器人开发',
        date: '2021.06 - 2023.06',
        stack: 'STM32 · RT-Thread · C/C++ · CAN/SPI/UART · PID 闭环 · Kalman 滤波 · OpenCV',
        points: [
          '统筹全队电控/视觉方案设计，基于 STM32+RT-Thread 模块化底盘/云台/发射/通信系统',
          '双轴 PID 云台防抖、斜坡速度控制、麦轮避障、卡弹反转保护等完整对抗逻辑',
        ],
        desc: '🏆 2022 南部赛区二等奖 · 2023 全国总决赛三等奖',
      },
      {
        name: '开源个人项目',
        stack: 'clash_lan · Qt6ModBusSlave · code-journey · openPanda · 技术博客',
        desc: '涵盖局域网代理、Modbus 仿真工具、算法学习示例、Vue3 技术交流平台，配套嵌入式开发实操文档。',
      },
    ],
    skillsTitle: '专业技能',
    skills: [
      { label: '编程语言', text: '熟练 C/C++、Python、Golang；掌握面向对象编程、经典数据结构与算法' },
      { label: '嵌入式 & 底层', text: 'STM32 HAL 库、RT-Thread/FreeRTOS；RK3568/RK3576 Linux 内核、设备树、驱动开发；OpenEuler 移植' },
      { label: '通信协议', text: 'UART/I²C/SPI/CAN/RS485、Socket、MQTT、Modbus、LoRa、IEC104、IEC61850' },
      { label: '机器视觉', text: 'OpenCV、YOLOv8、DeepSORT、Kalman 滤波、TensorRT 推理加速' },
      { label: '上位机开发', text: 'Qt/PyQt QThread 多线程、信号与槽、MQTT 调试 GUI 工具' },
      { label: '边缘计算 & 容器', text: 'EdgeX Foundry 微服务架构、Docker 容器化、CMake 工程化、Git' },
      { label: '机器人', text: 'ROS/ROS2 节点通信、SLAM 安防巡逻机器人完整开发经验' },
      { label: '工程能力', text: '电力物联网网关全流程研发、多项目并行管理、EMC 测试、现场部署、跨部门协同' },
    ],
    eduTitle: '教育经历',
    edu: {
      school: '贵州师范学院',
      major: '计算机科学与技术 · 本科',
      date: '2020.09 - 2024.07',
      points: [
        '校园任职：班长、智电协会负责人、机器人战队队长',
        '荣誉：2021-2022 十佳优秀团员 · 2022-2023 校级二等奖学金',
      ],
    },
    awardsTitle: '竞赛 & 证书',
    awards: [
      '全国大学生光电设计竞赛：2021 西南赛区三等奖、2022 全国二等奖',
      '"互联网+" 大学生创新创业大赛（产业赛道）：2022 省级银奖',
      '国家级大创《基于 Ros2 的 SLAM 安防巡逻机器人》2023',
      '省级大创《基于 OpenCV 的双云台哨兵机器人》2022',
      '计算机软件著作权 1 项 · CET4: 479 · CET6: 407',
      '2025 年度"优秀新员工"（四川汇源光通信）',
    ],
    footer: '持续学习，实践探索，知识分享。',
  },

  // --- 页脚 ---
  footer: {
    copyright: '© 2026 开源熊猫 - 嵌入式技术交流平台',
    poweredBy: 'Powered by Vue3 + Gin + PostgreSQL',
  },

  // --- AI 助手 ---
  ai: {
    title: 'AI 助手',
    selectModel: '选择模型',
    clearChat: '清空对话',
    stop: '停止',
    send: '发送',
    inputPlaceholder: '输入你的问题，按 Enter 发送，Shift+Enter 换行...',
    welcomeTitle: '开始 AI 对话',
    welcomeDesc: '选择一个 AI 模型，然后输入你的问题',
    generating: 'AI 回复中...',
    connecting: '正在连接 AI...',
    copySuccess: '已复制到剪贴板',
    copyFailed: '复制失败',
    hint: 'Enter 发送 · Shift+Enter 换行',
  },
}
