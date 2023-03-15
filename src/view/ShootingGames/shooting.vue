<template>
  <div id='ui'>
    <div id='ammo'>
      <div class='icon'>
        <img src='../../assets/factory/ammo.svg' alt='ammo-icon'>
      </div>
      <div class="progressBase">
        <div class="progressBar" name="ammoBar"></div>
      </div>
    </div>
    <div id='health'>
      <div class="progressBase">
        <div class="progressBar" name="healthBar"></div>
      </div>
      <div class='icon'>
        <img src='../../assets/factory/health.svg' alt='health-icon'>
      </div>
    </div>
    <div id='playBtn'>
      <img src='../../assets/factory/playgame.png' alt='play game'>
    </div>
    <div id='gameover'>
      <img src='../../assets/factory/gameover.png' alt='gameover'>
    </div>
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
#ui{
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  /*padding: 10px;*/
  display: none;
}

#ammo{
  position: absolute;
  top: 10px;
  left: 10px;
  height: 40px;
  width: 160px;
  display: flex;
  align-items: center;
}

#health{
  position: absolute;
  top: 10px;
  right: 10px;
  width: 160px;
  height: 40px;
  display: flex;
  align-items: center;
}

.icon{
  width: 30px;
  height: 30px;
  padding: 10px;
}

.progressBase{
  width: 100px;
  height: 15px;
  background-color: white;
  border-radius: 10px;
}

.progressBar{
  width: 100%;
  height: 15px;
  background-color: sienna;
  border-radius: 10px;
}

#playBtn{
  position:absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: none;
}

#gameover{
  position:absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
}
</style>
