<template>
  <div id="video-wrap">
<!--      controls-->
      <video class="video" v-for="(url,index) in videoList" :key="url"  controls :id="url" :src="url">

      </video>

  </div>
</template>

<script>
export default {
  name: "videoSwitch",
  data() {
    return {

      videoList: [
          // 'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/5.mp4',
          'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/6.mp4',
          'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/7.mp4',
          'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/8.mp4',
          'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/9.mp4'
      ],
      videoElements: null,
      current: 0,
      first: true
    }
  },

  created() {


  },

  mounted() {
    this.videoElements = document.querySelectorAll('.video')
    // console.log(videoList,'videoList')

    // setTimeout(() => {
     this.playVideo()
    // },3000)


    // videoList[0].ended()

  },

  methods: {
    playVideo() {
      let videoElements = document.querySelectorAll('.video')
      //console.log(videoElements[0].id,'videoElements')

      if (videoElements.length == 0) return


      videoElements.forEach(element => {
        element.style.display = 'none'
      })
      videoElements[this.current].style.display = 'block'

      if (this.first) {
        //videoElements[this.current].muted = true
        this.first = false
      } else {
        videoElements[this.current].play()
        videoElements[this.current].muted = false
      }


      // videoElements[this.current].muted = false



      //videoElements[this.current].play()



      videoElements[this.current].addEventListener('ended', ()=> { //结束
        console.log("播放结束");
        // videoElements[this.current].removeEventListener('ended',() => {
          let element = document.getElementById(videoElements[this.current].id)
          console.log(element)
          element.remove()
        // })
        // this.current++

        if (videoElements.length < 5) {
          const videos = document.createElement('video')
          videos.src = 'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/10.mp4'
          videos.id = 'https://ant-wh.oss-cn-hangzhou.aliyuncs.com/video/dong/10.mp4' + Math.random()
          videos.className = 'video'
          videos.controls = false

          document.getElementById('video-wrap').append(videos)

        }


        this.playVideo()
      }, false);

    }
  }


}
</script>

<style>

/*video:nth-child(1) {*/
/*  display: block;*/
/*}*/

video {
  width: 300px;
  height: 300px;
  /*display: none;*/
}

</style>
