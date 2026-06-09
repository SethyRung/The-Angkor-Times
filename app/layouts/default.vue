<template>
  <div class="min-h-screen flex flex-col font-mono">
    <AppHeader />
    <UMain class="flex-1">
      <slot />
    </UMain>
    <AppFooter />
  </div>
</template>
