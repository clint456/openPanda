<!--
  文件: views/About/index.vue
  说明: 关于作者简历页
-->
<template>
  <div class="about-page">
    <!-- 头部 -->
    <div class="about__header">
      <h1>{{ $t('about.name') }}</h1>
      <p class="about__contact">
        <span>📱 {{ $t('about.phone') }}</span>
        <span>📧 {{ $t('about.email') }}</span>
        <a :href="$t('about.githubUrl')" target="_blank">💻 GitHub</a>
        <a :href="$t('about.siteUrl')" target="_blank">🌐 {{ $t('about.site') }}</a>
      </p>
    </div>

    <!-- 工作经历 -->
    <div class="about__section">
      <h2>💼 {{ $t('about.workTitle') }}</h2>

      <div class="exp__item">
        <div class="exp__head">
          <strong>{{ $t('about.work1.role') }}</strong>
          <el-tag size="small" type="success">{{ $t('about.work1.status') }}</el-tag>
        </div>
        <p class="exp__org">{{ $t('about.work1.org') }}</p>
        <ul>
          <li v-for="(item, i) in $t('about.work1.points')" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div class="exp__item">
        <div class="exp__head">
          <strong>{{ $t('about.work2.role') }}</strong>
          <span class="exp__date">{{ $t('about.work2.date') }}</span>
        </div>
        <p class="exp__org">{{ $t('about.work2.org') }}</p>
        <p class="exp__desc">{{ $t('about.work2.desc') }}</p>
      </div>

      <div class="exp__item">
        <div class="exp__head">
          <strong>{{ $t('about.work3.role') }}</strong>
          <span class="exp__date">{{ $t('about.work3.date') }}</span>
        </div>
        <p class="exp__org">{{ $t('about.work3.org') }}</p>
        <p class="exp__desc">{{ $t('about.work3.desc') }}</p>
      </div>
    </div>

    <!-- 项目经历 -->
    <div class="about__section">
      <h2>🚀 {{ $t('about.projectsTitle') }}</h2>

      <div v-for="proj in $t('about.projects')" :key="proj.name" class="proj__item">
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
      <h2>🛠️ {{ $t('about.skillsTitle') }}</h2>
      <div class="skills__grid">
        <div v-for="sk in $t('about.skills')" :key="sk.label" class="skill__card">
          <span class="skill__label">{{ sk.label }}</span>
          <p class="skill__text">{{ sk.text }}</p>
        </div>
      </div>
    </div>

    <!-- 教育 -->
    <div class="about__section">
      <h2>🎓 {{ $t('about.eduTitle') }}</h2>
      <p><strong>{{ $t('about.edu.school') }}</strong> · {{ $t('about.edu.major') }} · {{ $t('about.edu.date') }}</p>
      <ul>
        <li v-for="(item, i) in $t('about.edu.points')" :key="i">{{ item }}</li>
      </ul>
    </div>

    <!-- 竞赛 & 证书 -->
    <div class="about__section">
      <h2>🏆 {{ $t('about.awardsTitle') }}</h2>
      <ul>
        <li v-for="(item, i) in $t('about.awards')" :key="i">{{ item }}</li>
      </ul>
    </div>

    <!-- 底部 -->
    <div class="about__footer">
      <el-divider />
      <p>🚀 <strong>{{ $t('about.footer') }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯静态页面，内容由 i18n 驱动
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
