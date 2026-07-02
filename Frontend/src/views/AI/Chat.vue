<!--
  Chat.vue - AI Chat page with built-in provider settings drawer
  Admin only. Supports DeepSeek / Qwen / ChatGPT / Claude via SSE streaming.
-->
<template>
  <div class="ai-chat">
    <!-- ============================================================
    Header: model selector + settings + clear
    ============================================================ -->
    <div class="ai-chat__header">
      <h2 class="ai-chat__title">AI Assistant</h2>
      <div class="ai-chat__controls">
        <el-select
          v-model="currentProvider"
          placeholder="Select model"
          :disabled="isLoading"
          class="provider-select"
          @change="onProviderChange"
        >
          <el-option
            v-for="p in providers"
            :key="p.key"
            :label="p.name"
            :value="p.key"
          >
            <span class="provider-option">
              {{ getProviderIcon(p.key) }} {{ p.name }}
              <span class="provider-model">{{ p.model }}</span>
            </span>
          </el-option>
        </el-select>
        <el-button :icon="Setting" circle title="Provider Settings" @click="openSettings" />
        <el-button :icon="Delete" circle :disabled="isLoading" title="Clear Chat" @click="clearChat" />
      </div>
    </div>

    <!-- ============================================================
    Messages area
    ============================================================ -->
    <div class="ai-chat__messages" ref="messagesContainer">
      <!-- No provider configured -->
      <div v-if="providers.length === 0 && !loadingProviders" class="ai-chat__welcome">
        <div class="welcome-icon">⚙️</div>
        <h3>No AI providers configured</h3>
        <p>Click the gear icon above to add API keys, or set environment variables and restart.</p>
        <el-button type="primary" @click="openSettings">Configure Providers</el-button>
      </div>

      <!-- Welcome / suggestions -->
      <div v-else-if="messages.length === 0" class="ai-chat__welcome">
        <div class="welcome-icon">💬</div>
        <h3>Start a conversation</h3>
        <p>Select a model and type your question below</p>
        <div class="welcome-suggestions">
          <el-tag
            v-for="q in suggestions"
            :key="q"
            class="suggestion-tag"
            @click="sendMessage(q)"
          >{{ q }}</el-tag>
        </div>
      </div>

      <!-- Chat messages -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="ai-chat__message"
        :class="`ai-chat__message--${msg.role}`"
      >
        <div class="message-avatar">
          <span v-if="msg.role === 'user'">🥷</span>
          <span v-else>🤓</span>
        </div>
        <div class="message-body">
          <div class="message-role">{{ msg.role === 'user' ? 'You' : currentProviderName }}</div>
          <div
            v-if="msg.role === 'assistant'"
            class="message-content message-content--md"
            v-html="renderMarkdown(msg.content)"
          />
          <div v-else class="message-content">{{ msg.content }}</div>
          <span
            v-if="msg.role === 'assistant' && idx === messages.length - 1 && isLoading"
            class="streaming-cursor"
          >|</span>
        </div>
        <el-button
          v-if="msg.role === 'assistant' && msg.content"
          :icon="CopyDocument"
          circle
          size="small"
          class="copy-btn"
          title="Copy"
          @click="copyContent(msg.content)"
        />
      </div>
    </div>

    <!-- ============================================================
    Input area
    ============================================================ -->
    <div class="ai-chat__input">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="Type your question (Enter to send, Shift+Enter for new line)..."
        :disabled="isLoading"
        resize="none"
        @keydown.enter.exact.prevent="sendMessage()"
      />
      <div class="input-actions">
        <span class="input-hint">{{ isLoading ? 'AI is responding...' : 'Enter send / Shift+Enter new line' }}</span>
        <el-button v-if="isLoading" type="danger" :icon="Close" @click="stopGeneration">Stop</el-button>
        <el-button v-else type="primary" :icon="Promotion" :disabled="!inputText.trim() || !currentProvider" @click="sendMessage()">Send</el-button>
      </div>
    </div>

    <!-- ============================================================
    Settings Drawer
    ============================================================ -->
    <el-drawer
      v-model="drawerVisible"
      title="AI Provider Settings"
      direction="rtl"
      size="480px"
    >
      <div class="settings-body">
        <p class="settings-tip">
          API keys take effect immediately after saving. No restart needed.
          Environment variables also work - database values take priority.
        </p>

        <el-collapse v-model="activeTab" accordion>
          <el-collapse-item
            v-for="p in settingDefs"
            :key="p.key"
            :name="p.key"
          >
            <template #title>
              <div class="settings-title">
                <span>{{ p.icon }} {{ p.name }}</span>
                <el-tag :type="forms[p.key]?.apiKey ? 'success' : 'info'" size="small">
                  {{ forms[p.key]?.apiKey ? 'Configured' : 'Not set' }}
                </el-tag>
              </div>
            </template>

            <el-form label-position="top" size="default" class="settings-form">
              <el-form-item label="API Key">
                <el-input v-model="forms[p.key].apiKey" type="password" show-password placeholder="sk-..." />
              </el-form-item>
              <el-form-item label="Base URL">
                <el-input v-model="forms[p.key].baseUrl" placeholder="https://api.xxx.com" />
              </el-form-item>
              <el-form-item label="Model">
                <el-input v-model="forms[p.key].model" placeholder="model-name" />
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>

        <div class="settings-actions">
          <el-button @click="drawerVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="saving" @click="saveSettings">Save & Apply</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, CopyDocument, Promotion, Close, Setting } from '@element-plus/icons-vue'
import { marked } from 'marked'
import http from '@/api'
import { getAIProviders, chatWithAI, type AIProvider, type ChatMessage } from '@/api/modules/ai'

marked.setOptions({ breaks: true, gfm: true })

// ========== Chat state ==========
const providers = ref<AIProvider[]>([])
const currentProvider = ref('')
const currentProviderName = ref('AI')
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const isLoading = ref(false)
const loadingProviders = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
let abortController: AbortController | null = null

const suggestions = [
  'What is OpenPanda?',
  'Write an outline for an Embedded Linux tutorial',
  'Compare STM32 vs ESP32',
  'Explain FreeRTOS task scheduling',
]

// ========== Settings drawer state ==========
const drawerVisible = ref(false)
const activeTab = ref('deepseek')
const saving = ref(false)

interface SettingItem { key: string; value: string; label: string; group: string }
interface ProviderForm { apiKey: string; baseUrl: string; model: string }

const settingDefs = [
  { key: 'deepseek',  name: 'DeepSeek',  icon: '🐋', prefix: 'ai.deepseek' },
  { key: 'qwen',      name: 'Qwen',      icon: '☁️', prefix: 'ai.qwen' },
  { key: 'openai',    name: 'ChatGPT',   icon: '🧠', prefix: 'ai.openai' },
  { key: 'anthropic', name: 'Claude',    icon: '🧪', prefix: 'ai.anthropic' },
]

const forms = reactive<Record<string, ProviderForm>>(
  Object.fromEntries(settingDefs.map(p => [p.key, reactive<ProviderForm>({ apiKey: '', baseUrl: '', model: '' })]))
)

// ========== Chat methods ==========
function getProviderIcon(key: string) {
  const m: Record<string, string> = { deepseek: '🐋', qwen: '☁️', openai: '🧠', anthropic: '🧪' }
  return m[key] || '🤖'
}
function onProviderChange(key: string) {
  const p = providers.value.find(x => x.key === key)
  if (p) currentProviderName.value = p.name
}
function renderMarkdown(text: string) { return text ? (marked.parse(text) as string) : '' }

async function sendMessage(text?: string) {
  const content = (text || inputText.value).trim()
  if (!content || !currentProvider.value || isLoading.value) return
  messages.value.push({ role: 'user', content })
  inputText.value = ''
  await scrollToBottom()
  const aiMsg: ChatMessage = { role: 'assistant', content: '' }
  messages.value.push(aiMsg)
  isLoading.value = true
  abortController = chatWithAI(
    { provider: currentProvider.value, messages: messages.value.slice(0, -1) },
    (chunk) => { aiMsg.content += chunk; scrollToBottom() },
    () => { isLoading.value = false; abortController = null; if (!aiMsg.content) messages.value.pop() },
    (err) => { isLoading.value = false; abortController = null; aiMsg.content = `Error: ${err}`; ElMessage.error('AI failed: ' + err) },
  )
}
function stopGeneration() { abortController?.abort(); abortController = null; isLoading.value = false }
function clearChat() { stopGeneration(); messages.value = [] }
async function copyContent(text: string) {
  try { await navigator.clipboard.writeText(text); ElMessage.success('Copied') }
  catch { ElMessage.error('Copy failed') }
}
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}

// ========== Settings methods ==========
function openSettings() { drawerVisible.value = true }

async function loadSettings() {
  try {
    const { data } = await http.get('/admin/settings/ai')
    const items: SettingItem[] = data.data || []
    for (const item of items) {
      for (const p of settingDefs) {
        if (item.key === `${p.prefix}.api_key`) forms[p.key].apiKey = item.value
        else if (item.key === `${p.prefix}.base_url`) forms[p.key].baseUrl = item.value
        else if (item.key === `${p.prefix}.model`) forms[p.key].model = item.value
      }
    }
  } catch { /* ok */ }
}

async function saveSettings() {
  saving.value = true
  try {
    const settings: SettingItem[] = []
    for (const p of settingDefs) {
      const f = forms[p.key]
      settings.push(
        { key: `${p.prefix}.api_key`, value: f.apiKey, label: `${p.name} API Key`, group: 'ai' },
        { key: `${p.prefix}.base_url`, value: f.baseUrl, label: `${p.name} Base URL`, group: 'ai' },
        { key: `${p.prefix}.model`, value: f.model, label: `${p.name} Model`, group: 'ai' },
      )
    }
    await http.put('/admin/settings/ai', settings)
    ElMessage.success('Saved. Reloading providers...')
    drawerVisible.value = false
    await refreshProviders()
  } catch {
    ElMessage.error('Save failed')
  } finally {
    saving.value = false
  }
}

// ========== Provider loading ==========
async function refreshProviders() {
  loadingProviders.value = true
  try {
    const { data } = await getAIProviders()
    if (data.data?.length) {
      providers.value = data.data
      if (!currentProvider.value || !providers.value.find(p => p.key === currentProvider.value)) {
        currentProvider.value = data.data[0].key
        currentProviderName.value = data.data[0].name
      }
    } else {
      providers.value = []
      currentProvider.value = ''
    }
  } catch { /* ok */ }
  finally { loadingProviders.value = false }
}

onMounted(async () => {
  await loadSettings()
  await refreshProviders()
})
</script>

<style scoped>
/* ── Layout ── */
.ai-chat {
  display: flex; flex-direction: column;
  height: calc(100vh - 120px); max-width: 900px; margin: 0 auto; padding: 16px;
  color: var(--text-primary);
}

/* ── Header ── */
.ai-chat__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; margin-bottom: 12px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}
.ai-chat__title { font-size: 18px; font-weight: 600; margin: 0; color: var(--text-primary); }
.ai-chat__controls { display: flex; align-items: center; gap: 8px; }
.provider-select { width: 200px; }
.provider-option { display: flex; align-items: center; gap: 6px; }
.provider-model { font-size: 11px; color: var(--text-muted); margin-left: auto; }

/* ── Messages ── */
.ai-chat__messages { flex: 1; overflow-y: auto; padding: 8px 0; scroll-behavior: smooth; }
.ai-chat__messages::-webkit-scrollbar { width: 6px; }
.ai-chat__messages::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

/* Welcome */
.ai-chat__welcome { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
.welcome-icon { font-size: 48px; margin-bottom: 16px; }
.ai-chat__welcome h3 { margin: 0 0 8px; font-size: 20px; color: var(--text-primary); }
.ai-chat__welcome p { margin: 0 0 24px; font-size: 14px; }
.welcome-suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.suggestion-tag { cursor: pointer; transition: all .2s; }
.suggestion-tag:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(128,128,128,.25); }

/* Message bubble */
.ai-chat__message { display: flex; gap: 12px; padding: 12px 8px; animation: msgIn .3s ease-out; }
.ai-chat__message--assistant { background: var(--bg-white); border-radius: 8px; }
@keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.message-avatar {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0; border-radius: 50%;
  background: rgba(200, 117, 74, .15);
}
.message-body { flex: 1; min-width: 0; overflow: hidden; }
.message-role { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
.message-content { font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; color: var(--text-primary); }
.streaming-cursor { display: inline-block; animation: blink 1s step-end infinite; color: var(--color-primary); font-weight: bold; }
@keyframes blink { 50% { opacity: 0; } }
.copy-btn { flex-shrink: 0; align-self: flex-start; opacity: 0; transition: opacity .2s; margin-top: 20px; }
.ai-chat__message:hover .copy-btn { opacity: 1; }

/* ── Markdown ── */
.message-content--md :deep(h1),
.message-content--md :deep(h2),
.message-content--md :deep(h3) { margin: 16px 0 8px; font-weight: 600; color: var(--text-primary); }
.message-content--md :deep(h1) { font-size: 1.4em; }
.message-content--md :deep(h2) { font-size: 1.2em; }
.message-content--md :deep(h3) { font-size: 1.1em; }
.message-content--md :deep(p) { margin: 8px 0; }
.message-content--md :deep(ul),
.message-content--md :deep(ol) { padding-left: 20px; margin: 8px 0; }
.message-content--md :deep(li) { margin: 4px 0; }
.message-content--md :deep(code) {
  background: var(--border-color); padding: 2px 6px; border-radius: 4px;
  font-size: .9em; font-family: 'Fira Code', 'Cascadia Code', monospace;
  color: var(--color-primary-dark);
}
.message-content--md :deep(pre) {
  background: #1e1e2e; color: #cdd6f4; padding: 16px; border-radius: 8px;
  overflow-x: auto; margin: 12px 0;
}
.message-content--md :deep(pre code) { background: none; padding: 0; color: inherit; }
.message-content--md :deep(blockquote) {
  border-left: 3px solid var(--color-primary); padding-left: 12px;
  margin: 8px 0; color: var(--text-secondary);
}
.message-content--md :deep(table) { border-collapse: collapse; margin: 8px 0; width: 100%; }
.message-content--md :deep(th),
.message-content--md :deep(td) { border: 1px solid var(--border-color); padding: 8px 12px; text-align: left; }
.message-content--md :deep(th) { background: var(--border-color); font-weight: 600; }

/* ── Input ── */
.ai-chat__input { flex-shrink: 0; padding: 12px 0 0; border-top: 1px solid var(--border-color); }
.input-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.input-hint { font-size: 12px; color: var(--text-muted); }

/* ── Settings drawer ── */
.settings-body { padding: 0 4px; color: var(--text-primary); }
.settings-tip { font-size: 13px; color: var(--text-secondary); margin: 0 0 16px; line-height: 1.6; }
.settings-title { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: 16px; font-size: 14px; font-weight: 500; }
.settings-form { padding: 8px 0; }
.settings-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }

/* ── Dark mode overrides for code block & drawer ── */
[data-theme='dark'] .message-content--md :deep(pre) { background: #16161e; color: #e0e0f0; }
[data-theme='dark'] .message-content--md :deep(code) { background: #3d3d48; color: var(--color-primary-light); }
[data-theme='dark'] .message-content--md :deep(th) { background: #33333d; }
[data-theme='dark'] .streaming-cursor { color: var(--color-primary-light); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .ai-chat { height: calc(100vh - 80px); padding: 8px; }
  .provider-select { width: 140px; }
  .ai-chat__title { font-size: 16px; }
  .message-avatar { width: 30px; height: 30px; font-size: 16px; }
}
</style>
