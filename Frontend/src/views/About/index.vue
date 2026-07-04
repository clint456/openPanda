<!--
  文件: views/About/index.vue
  说明: 关于作者页面
        展示作者简介、GitHub 统计、技术栈、项目经历
-->
<template>
  <div class="about-page">
    <div class="about__header">
      <h1>{{ $t('about.title') }}</h1>
      <p class="about__subtitle">{{ $t('about.subtitle') }}</p>
    </div>

    <!-- GitHub 统计卡片 -->
    <div class="about__stats">
      <img
        src="https://github-stats-extended.vercel.app/api?username=clint456&include_all_commits=true&theme=ocean_dark"
        alt="GitHub Stats"
        class="stats__card"
      />
      <img
        src="https://github-stats-extended.vercel.app/api/top-langs?username=clint456&langs_count=6&theme=chartreuse-dark"
        alt="Top Languages"
        class="stats__card"
      />
      <img
        src="https://github-stats-extended.vercel.app/api/wakatime?username=alan&langs_count=5&display_format=percent&theme=chartreuse-dark"
        alt="WakaTime Stats"
        class="stats__card"
      />
    </div>

    <!-- 关于我 -->
    <div class="about__section">
      <h2>👋 关于我</h2>
      <p>
        嵌入式软件开发者，专注于 <strong>RK3568 嵌入式开发</strong>与
        <strong>EdgeX 边缘计算</strong>领域。擅长使用 <strong>Golang</strong>
        与 Docker 容器化技术，构建部署轻量稳定的边缘物联网服务，
        信奉 <strong>"think less, do more"</strong> 的工程哲学。
      </p>
    </div>

    <!-- 项目与技术实践 -->
    <div class="about__section">
      <h2>⚡ 项目与技术实践</h2>
      <ul class="about__list">
        <li>
          <strong>EdgeX 开发</strong>：熟练掌握 device-core-application 分层架构，
          实现传感器数据采集、过滤、处理与 HTTP / MQTT 转发。
        </li>
        <li>
          <strong>嵌入式部署</strong>：在 RK3568 边缘板卡上完成 Docker + Go
          运行环境配置与 EdgeX 容器化部署。
        </li>
        <li>
          <strong>Linux 实践</strong>：熟悉 Ubuntu 开发环境与 VMware 虚拟化操作，
          支撑嵌入式项目调试。
        </li>
        <li>
          <strong>基础技术 & 文档沉淀</strong>：掌握 C++ 排序算法与 CMake 编译；
          技术实践全部记录于
          <a href="https://clint456.github.io" target="_blank">clint456.github.io</a>。
        </li>
      </ul>
    </div>

    <!-- 核心技术栈 -->
    <div class="about__section">
      <h2>🛠️ 核心技术栈</h2>
      <div class="about__skills">
        <div class="skill__group">
          <span class="skill__label">平台</span>
          <el-tag>RK3568</el-tag>
          <el-tag>Linux (Ubuntu)</el-tag>
        </div>
        <div class="skill__group">
          <span class="skill__label">框架</span>
          <el-tag type="success">EdgeX Foundry</el-tag>
        </div>
        <div class="skill__group">
          <span class="skill__label">语言</span>
          <el-tag type="warning">Golang</el-tag>
          <el-tag type="warning">C / C++</el-tag>
        </div>
        <div class="skill__group">
          <span class="skill__label">工具</span>
          <el-tag type="danger">Docker</el-tag>
          <el-tag type="danger">CMake</el-tag>
          <el-tag type="danger">VMware</el-tag>
        </div>
      </div>
    </div>

    <!-- 兴趣爱好 -->
    <div class="about__section">
      <h2>🎮 兴趣爱好</h2>
      <p>业余时间喜欢打 CS2，定期健身，保持平衡高效的生活方式。</p>
    </div>

    <!-- 底部 -->
    <div class="about__footer">
      <el-divider />
      <p>🚀 <strong>持续学习，实践探索，知识分享。</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯静态页面，无需逻辑
</script>

<style scoped>
.about-page {
  max-width: 860px;
  margin: 0 auto;
}

.about__header {
  text-align: center;
  margin-bottom: 40px;
}

.about__header h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.about__subtitle {
  color: #909399;
  font-size: 16px;
}

/* GitHub 统计卡片 */
.about__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
}

.stats__card {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* 内容区块 */
.about__section {
  background: #fff;
  padding: 28px 32px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.about__section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.about__section p {
  line-height: 1.9;
  color: #303133;
}

/* 技术实践列表 */
.about__list {
  padding-left: 20px;
  line-height: 2;
}

.about__list li {
  margin-bottom: 8px;
}

.about__list a {
  color: #409eff;
  text-decoration: none;
}

.about__list a:hover {
  text-decoration: underline;
}

/* 技能标签 */
.about__skills {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill__group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.skill__label {
  font-weight: bold;
  min-width: 48px;
  color: #606266;
}

.about__footer {
  text-align: center;
  color: #909399;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .about__stats {
    flex-direction: column;
    align-items: center;
  }

  .about__section {
    padding: 20px 16px;
  }
}
</style>
