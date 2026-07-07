<!--
  文件: views/About/index.vue
  说明: 关于作者简历页
-->
<template>
  <div class="about-page">
    <!-- 头部 -->
    <div class="about__header">
      <h1>{{ data.name }}</h1>
      <p class="about__contact">
        <span>📧 {{ data.email }}</span>
        <a :href="data.githubUrl" target="_blank">💻 GitHub</a>
        <a :href="data.siteUrl" target="_blank">🌐 {{ data.site }}</a>
      </p>
    </div>

    <!-- 工作经历 -->
    <div class="about__section">
      <h2>💼 {{ data.workTitle }}</h2>

      <div class="exp__item">
        <div class="exp__head">
          <strong>{{ data.work1.role }}</strong>
          <el-tag size="small" type="success">{{ data.work1.status }}</el-tag>
        </div>
        <p class="exp__org">{{ data.work1.org }}</p>
        <ul>
          <li v-for="(item, i) in data.work1.points" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div class="exp__item">
        <div class="exp__head">
          <strong>{{ data.work2.role }}</strong>
          <span class="exp__date">{{ data.work2.date }}</span>
        </div>
        <p class="exp__org">{{ data.work2.org }}</p>
        <p class="exp__desc">{{ data.work2.desc }}</p>
      </div>
    </div>

    <!-- 项目经历 -->
    <div class="about__section">
      <h2>🚀 {{ data.projectsTitle }}</h2>

      <div v-for="proj in data.projects" :key="proj.name" class="proj__item">
        <div class="proj__head">
          <strong>{{ proj.name }}</strong>
          <span class="proj__date" v-if="proj.date">{{ proj.date }}</span>
        </div>
        <p class="proj__stack"><em>{{ proj.stack }}</em></p>
        <ul v-if="proj.points">
          <li v-for="(pt, i) in proj.points" :key="i">{{ pt }}</li>
        </ul>
        <p v-if="proj.desc" class="proj__desc">{{ proj.desc }}</p>
      </div>
    </div>

    <!-- 专业技能 -->
    <div class="about__section">
      <h2>🛠️ {{ data.skillsTitle }}</h2>
      <div class="skills__grid">
        <div v-for="sk in data.skills" :key="sk.label" class="skill__card">
          <span class="skill__label">{{ sk.label }}</span>
          <p class="skill__text">{{ sk.text }}</p>
        </div>
      </div>
    </div>

    <!-- 教育 -->
    <!-- <div class="about__section">
      <h2>🎓 {{ data.eduTitle }}</h2>
      <p><strong>{{ data.edu.school }}</strong> · {{ data.edu.major }} · {{ data.edu.date }}</p>
      <ul>
        <li v-for="(item, i) in data.edu.points" :key="i">{{ item }}</li>
      </ul>
    </div> -->

    <!-- 竞赛 & 证书 -->
    <!-- <div class="about__section">
      <h2>🏆 {{ data.awardsTitle }}</h2>
      <ul>
        <li v-for="(item, i) in data.awards" :key="i">{{ item }}</li>
      </ul>
    </div> -->

    <!-- 底部 -->
    <div class="about__footer">
      <el-divider />
      <p>🚀 <strong>{{ data.footer }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const zh = {
  name: 'Clinton',
  email: 'clinton_luo@163.com',
  githubUrl: 'https://github.com/clint456',
  site: 'clintonluo.com',
  siteUrl: 'https://www.clintonluo.com',
  workTitle: '工作经历',
  work1: {
    role: '嵌入式软件开发工程师',
    org: '四川汇源光通信（变电物联网产品线）· 在职',
    status: '在职',
    date: '2025.03 - 至今',
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
  // work3: {
  //   role: '信息技术 / 科创实习教师',
  //   org: '贵州省实验中学',
  //   date: '2023.08 - 2024.01',
  //   desc: '负责机器人及编程科创社团教学，开展嵌入式与机器视觉实训，指导学生完成机器人竞赛备赛与大创项目开发。',
  // },
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
  footer: '持续学习，实践探索，知识分享。',
}

const en = {
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
}

const data = computed(() => appStore.locale === 'en-US' ? en : zh)
</script>

<style scoped>
.about-page {
  max-width: 860px;
  margin: 0 auto;
}

/* Header */
.about__header {
  text-align: center;
  margin-bottom: 36px;
}
.about__header h1 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 10px;
}
.about__contact {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 18px;
  color: #606266;
  font-size: 14px;
}
.about__contact a {
  color: #409eff;
  text-decoration: none;
}
.about__contact a:hover {
  text-decoration: underline;
}

/* Section */
.about__section {
  background: #fff;
  padding: 24px 28px;
  margin-bottom: 18px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.about__section h2 {
  font-size: 19px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

/* Experience */
.exp__item {
  margin-bottom: 18px;
}
.exp__item:last-child { margin-bottom: 0; }
.exp__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.exp__org {
  color: #909399;
  font-size: 13px;
  margin: 2px 0 6px;
}
.exp__date {
  color: #909399;
  font-size: 13px;
}
.exp__desc {
  color: #606266;
  line-height: 1.8;
}
.about__section ul {
  padding-left: 18px;
  line-height: 1.9;
  color: #303133;
  margin: 4px 0 0;
}
.about__section li {
  margin-bottom: 4px;
}

/* Projects */
.proj__item {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ebeef5;
}
.proj__item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.proj__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.proj__date {
  color: #909399;
  font-size: 13px;
}
.proj__stack {
  color: #909399;
  font-size: 13px;
  margin: 2px 0 6px;
}
.proj__desc {
  color: #606266;
  font-size: 14px;
}

/* Skills grid */
.skills__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.skill__card {
  padding: 10px 14px;
  border-radius: 6px;
  background: #f8f9fa;
}
.skill__label {
  font-weight: bold;
  font-size: 13px;
  color: #409eff;
  display: block;
  margin-bottom: 4px;
}
.skill__text {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
}

/* Footer */
.about__footer {
  text-align: center;
  color: #909399;
  padding: 8px 0 20px;
}

@media (max-width: 768px) {
  .about__section {
    padding: 18px 14px;
  }
  .skills__grid {
    grid-template-columns: 1fr;
  }
  .about__contact {
    flex-direction: column;
    align-items: center;
  }
}
</style>
