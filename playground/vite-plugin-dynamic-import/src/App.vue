<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>
      <router-link to="/">Home</router-link> |
      <router-link to="/foo">Foo</router-link> |
      <router-link to="/bar">Bar</router-link>
    </div>
    <hr>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
