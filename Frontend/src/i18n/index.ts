// ============================================================
// 文件: i18n/index.ts
// 说明: 国际化(i18n)配置入口
//       使用 vue-i18n 库实现全站中英文切换
//
// 使用方式：
//   在 .vue 模板中：{{ $t('common.home') }}
//   在 .ts 文件中：import { useI18n } from 'vue-i18n'
//                   const { t } = useI18n()
//                   console.log(t('common.home'))
//
// 拓展方式：新增语言时
//   1. 新建 locales/ja-JP.ts（日文语言包）
//   2. 在此文件的 messages 中添加导入
// ============================================================
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'  // 中文语言包
import enUS from './locales/en-US'  // 英文语言包

// 获取用户上次选择的语言偏好（没有则默认中文）
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

// 创建 i18n 实例
const i18n = createI18n({
  // legacy: false 启用 Composition API 模式
  legacy: false,
  // locale: 当前使用的语言
  locale: savedLocale,
  // fallbackLocale: 找不到翻译时的回退语言
  fallbackLocale: 'zh-CN',
  // messages: 所有语言包
  messages: {
    'zh-CN': zhCN, // 中文
    'en-US': enUS, // 英文
    // 后续拓展：'ja-JP': jaJP, // 日文
  },
})

export default i18n
