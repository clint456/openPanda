// ============================================================
// 文件: i18n/locales/en-US.ts
// 说明: 英文语言包
//       结构与 zh-CN.ts 完全一致，方便对照翻译
// ============================================================

export default {
  // --- Common ---
  common: {
    home: 'Home',
    articles: 'Articles',
    categories: 'Categories',
    about: 'About',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No data',
    loadMore: 'Load More',
    viewCount: 'views',
    publishedAt: 'Published on',
  },

  // --- Navigation ---
  nav: {
    embeddedLinux: 'Embedded Linux',
    hardwareDesign: 'Hardware Design',
    mcuDevelopment: 'MCU Development',
    hotArticles: 'Hot Articles',
    latestArticles: 'Latest Articles',
    writeArticle: 'Write',
  },

  // --- Home Page ---
  homePage: {
    title: 'OpenPanda',
    subtitle: 'Embedded & Hardware Development Tech Blog',
    description: 'A personal tech blog focused on Embedded Linux, Hardware Design, and MCU Development',
    hotArticles: 'Hot Articles',
    latestArticles: 'Latest Articles',
  },

  // --- Article ---
  article: {
    detail: 'Article Detail',
    list: 'Article List',
    tags: 'Tags',
    category: 'Category',
    relatedArticles: 'Related Articles',
    backToList: 'Back to List',
    searchPlaceholder: 'Search articles...',
    searchResult: 'Search Results',
    noSearchResult: 'No articles found',
  },

  // --- Category ---
  category: {
    embeddedLinux: 'Embedded Linux',
    embeddedLinuxDesc: 'Linux environment setup, driver development, system porting',
    hardwareDesign: 'Hardware Design',
    hardwareDesignDesc: 'Schematic design, PCB layout, hardware debugging',
    mcuDevelopment: 'MCU Development',
    mcuDevelopmentDesc: 'STM32, ESP32 tutorials and project practices',
  },

  // --- About ---
  about: {
    name: 'Luo Qinwen',
    phone: '19985813415',
    email: 'clinton_luo@163.com',
    githubUrl: 'https://github.com/clint456',
    site: 'clintonluo.com',
    siteUrl: 'https://www.clintonluo.com',
    workTitle: 'Work Experience',
    work1: {
      role: 'Embedded Software Engineer',
      org: 'Sichuan Huiyuan Optical Communications (Substation IoT) · Current',
      status: 'Current',
      points: [
        'Led RK3568/RK3576 hardware platform iterations: kernel adaptation, driver development, system customization & EMC validation',
        'Developed EdgeX Foundry protocol parsing microservices; unified internal communication specs & API docs for upstream web teams',
        'Protocol standardization: Northbound MQTT/Modbus/IEC104, Southbound Modbus/LoRa/BLE/GPS/IEC104/custom MQTT',
        'Built cryptographic proxy service with NRSEC3000 security chip for end-to-end MQTT encryption',
        'Developed companion debugging tools for on-site deployment; drove access-node mass production & aggregation-node pilot delivery',
      ],
    },
    work2: {
      role: 'Embedded Software Engineer',
      org: 'Zhejiang University Huzhou Research Institute · Marine Robotics Center',
      date: '2024.02 - 2024.09',
      desc: 'Core developer for anti-drone shipborne laser strike system: computer vision algorithms, TensorRT edge inference, Qt6 HMI, cross-device integration, hardware selection & architecture design.',
    },
    work3: {
      role: 'IT / STEM Instructor',
      org: 'Guizhou Experimental High School',
      date: '2023.08 - 2024.01',
      desc: 'Taught robotics & programming clubs; delivered embedded systems and machine vision training; coached students for robotics competitions and undergraduate innovation projects.',
    },
    projectsTitle: 'Projects',
    projects: [
      {
        name: 'Power IoT Edge Gateway Series',
        date: '2025.03 - Present',
        stack: 'Linux · C/C++ · Golang · EdgeX Foundry · Docker · RK3568/RK3576 · Modbus · MQTT · LoRa · IEC104 · IEC61850 · SM Crypto',
        points: [
          'Device tree, kernel trimming & peripheral drivers for RK-series platforms (4G/WiFi/LoRa/NVMe/ADC/Watchdog)',
          'Independently built GPS/BLE/Modbus/LoRa/IEC104 southbound microservices on EdgeX MessageBus',
          'Developed crypto proxy microservice; built standardized power IoT model for bidirectional protocol exchange',
          'OpenEuler system porting; IEC61850 protocol stack microservice design for smart substation integration',
        ],
      },
      {
        name: 'Anti-Drone Laser Strike Shipborne System',
        date: '2024.02 - 2024.08',
        stack: 'Python · C++ · OpenCV · YOLOv8 · DeepSORT · TensorRT · Qt6 · Jetson Xavier NX',
        points: [
          'Custom dataset + YOLOv8 + DeepSORT + Kalman filter for multi-target tracking; TensorRT quantization for real-time inference',
          'Qt6 multi-threaded HMI: UDP multi-stream video, RS485 gimbal control, laser calibration & live visualization',
        ],
      },
      {
        name: 'RoboMaster Combat Robot Development',
        date: '2021.06 - 2023.06',
        stack: 'STM32 · RT-Thread · C/C++ · CAN/SPI/UART · PID Control · Kalman Filter · OpenCV',
        points: [
          'Led full-team electrical & vision design; modular chassis/turret/launcher/comm on STM32 + RT-Thread',
          'Dual-axis PID turret stabilization, ramp velocity control, mecanum obstacle avoidance, jam detection & reversal',
        ],
        desc: '🏆 2022 Southern Region 2nd Prize · 2023 National Finals 3rd Prize',
      },
      {
        name: 'Open-Source Projects',
        stack: 'clash_lan · Qt6ModBusSlave · code-journey · openPanda · Tech Blog',
        desc: 'LAN proxy, Modbus simulation tool, algorithm notebooks, Vue3 tech blog — with hands-on embedded development documentation.',
      },
    ],
    skillsTitle: 'Skills',
    skills: [
      { label: 'Languages', text: 'Proficient in C/C++, Python, Golang; OOP, classic data structures & algorithms' },
      { label: 'Embedded & Low-Level', text: 'STM32 HAL, RT-Thread/FreeRTOS; RK3568/RK3576 Linux kernel, device tree, drivers; OpenEuler porting' },
      { label: 'Communication Protocols', text: 'UART/I²C/SPI/CAN/RS485, Socket, MQTT, Modbus, LoRa, IEC104, IEC61850' },
      { label: 'Computer Vision', text: 'OpenCV, YOLOv8, DeepSORT, Kalman filter, TensorRT inference acceleration' },
      { label: 'Desktop GUI', text: 'Qt/PyQt QThread concurrency, signal-slot, MQTT debug GUI tools' },
      { label: 'Edge Computing & Containers', text: 'EdgeX Foundry microservices, Docker, CMake, Git' },
      { label: 'Robotics', text: 'ROS/ROS2 node communication, full SLAM security patrol robot development' },
      { label: 'Engineering', text: 'End-to-end power IoT gateway R&D, multi-project management, EMC testing, field deployment, cross-team collaboration' },
    ],
    eduTitle: 'Education',
    edu: {
      school: 'Guizhou Education University',
      major: 'Computer Science & Technology · B.E.',
      date: '2020.09 - 2024.07',
      points: [
        'Roles: Class President, Smart Electronics Association Lead, Robotics Team Captain',
        'Honors: 2021-2022 Top 10 Outstanding Youth League Member · 2022-2023 University Scholarship',
      ],
    },
    awardsTitle: 'Competitions & Certifications',
    awards: [
      'National Optoelectronic Design Contest: 2021 Southwest 3rd Prize, 2022 National 2nd Prize',
      '"Internet+" Innovation & Entrepreneurship Competition (Industry Track): 2022 Provincial Silver',
      'National Innovation Project: "SLAM Security Patrol Robot Based on ROS2" 2023',
      'Provincial Innovation Project: "Dual Gimbal Sentry Robot Based on OpenCV" 2022',
      '1 Software Copyright · CET4: 479 · CET6: 407',
      '2025 "Outstanding New Employee" (Sichuan Huiyuan Optical Communications)',
    ],
    footer: 'Keep learning. Build things. Share knowledge.',
  },

  // --- Footer ---
  footer: {
    copyright: '© 2026 OpenPanda - Personal Tech Blog',
    poweredBy: 'Powered by Vue3 + Gin + PostgreSQL',
  },

  // --- AI Assistant ---
  ai: {
    title: 'AI Assistant',
    selectModel: 'Select Model',
    clearChat: 'Clear Chat',
    stop: 'Stop',
    send: 'Send',
    inputPlaceholder: 'Type your question, Enter to send, Shift+Enter for new line...',
    welcomeTitle: 'Start AI Conversation',
    welcomeDesc: 'Select an AI model and ask your question',
    generating: 'AI is responding...',
    connecting: 'Connecting to AI...',
    copySuccess: 'Copied to clipboard',
    copyFailed: 'Copy failed',
    hint: 'Enter to send · Shift+Enter for new line',
  },
}
