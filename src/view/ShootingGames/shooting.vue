<template>
    <div>

    </div>
</template>

<script type="module" setup>
import {Game} from './Game.js'

import {onMounted} from "vue";

onMounted(() => {
  const game = new Game()
  window.app = game
})

</script>

<style scoped>

</style>
