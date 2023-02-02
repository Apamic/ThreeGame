<template>
  <div>
    <p id="instructions">收集星星. <br>避免炸弹. <br>空格键, 按下鼠标或触摸攀爬</p>
    <div id="info">
      <div id="life">
        <img src="../../assets/plane/plane-icon.png" /><div id="lives">3</div>
      </div>
      <div id="score-panel">
        <div id="score">0</div><img src="../../assets/plane/star-icon.png" />
      </div>
    </div>
    <p id="gameover">游戏结束</p>
    <button id="playBtn">play</button>
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
#playBtn{
  position: absolute;
  width: 180px;
  height: 100px;
  font-family: 'RocknRoll One', sans-serif;
  font-size: 36px;
  bottom: 100px;
  border-radius: 20px;
  background-color: darkblue;
  color: white;
  left: 50%;
  transform: translateX(-50%);
}
#instructions{
  position:absolute;
  bottom: 250px;
  font-family: 'RocknRoll One', sans-serif;
  font-size: 30px;
  color: darkblue;
  width: 300px;
  line-height: 30px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 20px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.5);
  text-align: center;
}
#gameover{
  display: none;
  position:absolute;
  bottom: 250px;
  font-family: 'RocknRoll One', sans-serif;
  font-size: 50px;
  color: darkblue;
  width: 300px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 20px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.5);
  text-align: center;
}
#info{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-family: 'RocknRoll One', sans-serif;
  font-size: 50px;
}
#info img{
  padding-top: 20px;
}
#life{
  position: absolute;
  left: 20px;
}
#score-panel{
  position: absolute;
  top: 0;
  right: 20px;
  float: right;
}
#lives{
  display: inline;
  position: relative;
  top: -15px;
}
#score{
  display: inline;
  position: relative;
  top: -15px;
}
</style>