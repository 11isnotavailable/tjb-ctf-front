<script setup lang="ts">
// App.vue是应用的根组件
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
@import './assets/base.css';
</style>
