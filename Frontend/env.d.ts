// ============================================================
// env.d.ts - 环境变量 TypeScript 类型声明
// 说明：让 TypeScript 知道 import.meta.env 中有哪些变量
//       .d.ts 文件只包含类型声明，不产生实际 JS 代码
// ============================================================

/// <reference types="vite/client" />

// 声明 .vue 文件的类型，让 TS 能识别 import Xxx from 'Xxx.vue'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>
  export default component
}

// 扩展 Vite 的 ImportMetaEnv 接口，声明自定义环境变量
interface ImportMetaEnv {
  /** 后端 API 基础地址 */
  readonly VITE_API_BASE_URL: string
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  // 后续拓展：在此添加新的环境变量声明
  // readonly VITE_NEW_VAR: string
}

// 扩展 ImportMeta 接口（Vite 使用 import.meta.env 访问环境变量）
interface ImportMeta {
  readonly env: ImportMetaEnv
}
