<script type="module" setup>

  import { App } from './class/app.js'
  document.addEventListener("DOMContentLoaded",() => {
    const app = new App()
    window.app = app
  })

</script>


<template>
  <div class="">
    <router-view />
  </div>

</template>

<style scoped>

</style>
