<template>
  <router-link to="/" class="brand-logo" :class="{ 'brand-logo--compact': compact }" :aria-label="label">
    <svg class="brand-logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path class="brand-logo__bracket" d="M14 8H9v24h5M26 8h5v24h-5" />
      <path class="brand-logo__letter" d="M17 29V11h5.5a5.5 5.5 0 0 1 0 11H17m0-11v18" />
    </svg>
    <span v-if="!compact" class="brand-logo__wordmark">OpenPanda<span class="brand-logo__dot">.</span></span>
  </router-link>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean; label?: string }>(), {
  compact: false,
  label: 'OpenPanda 首页',
})
</script>

<style scoped>
.brand-logo { display: inline-flex; align-items: center; gap: 9px; color: var(--text-primary); text-decoration: none; }
.brand-logo:hover { text-decoration: none; }.brand-logo__mark { width: 32px; height: 32px; flex: 0 0 auto; }
.brand-logo__bracket { fill: none; stroke: var(--text-secondary); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.2; }
.brand-logo__letter { fill: none; stroke: var(--button-background); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.6; }
.brand-logo__wordmark { font-family: var(--font-sans); font-size: 21px; font-weight: 650; letter-spacing: -.035em; line-height: 1; }
.brand-logo__dot { color: var(--button-background); }.brand-logo--compact { gap: 0; }.brand-logo--compact .brand-logo__mark { width: 28px; height: 28px; }
:lang(zh) .brand-logo__wordmark { letter-spacing: -.02em; }
@media(max-width: 640px) { .brand-logo__wordmark { font-size: 19px; } }
</style>