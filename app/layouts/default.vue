<template>
  <div class="min-h-screen flex flex-col bg-canvas-900">
    <AppHeader />
    <UMain class="flex-1">
      <slot />
    </UMain>
    <AppFooter />
  </div>
</template>
