// ============================================================
// 文件: .eslintrc.cjs
// 说明: ESLint 代码检查规则
//       配合 VSCode ESLint 插件使用，实时检查代码质量
// ============================================================
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',                     // ESLint 推荐规则
    'plugin:vue/vue3-recommended',            // Vue3 推荐规则
    'plugin:@typescript-eslint/recommended',  // TypeScript 推荐规则
    'prettier',                               // 关闭与 Prettier 冲突的规则
  ],
  parser: 'vue-eslint-parser',               // Vue 文件解析器
  parserOptions: {
    parser: '@typescript-eslint/parser',     // TS 解析器
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // 可根据需要调整规则
    '@typescript-eslint/no-explicit-any': 'warn', // any 类型警告（不阻止编译）
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用变量警告，_开头的参数忽略
    'vue/multi-word-component-names': 'off', // 允许单个单词的组件名
  },
}
