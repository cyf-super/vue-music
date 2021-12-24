<template lang="pug">
.player
  .normal-player(v-if="fillScreen")
    .background
      img(:src="currentSong.pic")
    .top
      .back(@click="goBack")
        i.icon-back
      .title {{ currentSong.name }}
      .subtitle {{ playMode }}
    .bottom
      .operators
        .icon.i-left
          i(:class="modeIcon" @click="changeMode")
        .icon.i-left(:class="disableCls")
          i.icon-prev(@click="prevPlay")
        .icon.i-center(:class="disableCls")
          i(
            :class="playIcon"
            @click="togglePlay"
          )
        .icon.i-right(:class="disableCls")
          i.icon-next(@click="nextPlay")
        .icon.i-right
          i.icon-not-favorite(
            :class="getFavoriteIcon(currentSong)"
            @click="toggleFavorite(currentSong)")
  audio(
    ref="audioRef"
    @pause="pause"
    @canplay="ready"
    @error="error"
    )
</template>

<script>
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { userMode } from './use-mode'
import { useFavorite } from './use-favorite'

export default defineComponent({
  name: 'player',
  setup() {
    const audioRef = ref(null)
    const songReady = ref(false)

    const store = useStore()
    const fillScreen = computed(() => store.state.fullScreen)
    const currentSong = computed(() => store.getters.currentSong)
    const currentIndex = computed(() => store.state.currentIndex)
    const playList = computed(() => store.state.playList)
    const playMode = computed(() => store.state.playMode)
    const playing = computed(() => store.state.playing)
    const playIcon = computed(() => {
      return playing.value ? 'icon-pause' : 'icon-play'
    })

    const disableCls = computed(() => {
      return songReady.value ? '' : 'disable'
    })

    watch(currentSong, (newSong, oldSong) => {
      console.log('newSong--->', newSong, oldSong)
      if (!newSong.id || !newSong.url) {
        return
      }
      // 歌曲变化的时候
      songReady.value = false
      const audioEl = audioRef.value
      audioEl.src = newSong.url
      audioEl.play()
    })

    watch(playing, (newPlaying) => {
      if (!songReady.value) {
        return
      }
      const audioEl = audioRef.value
      newPlaying ? audioEl.play() : audioEl.pause()
    })

    // hooks
    const { modeIcon, changeMode } = userMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()

    console.log('modeIcon-->', modeIcon.value)
    const goBack = function() {
      store.commit('setFullScreen', false)
    }

    const togglePlay = function() {
      if (!songReady.value) {
        return
      }
      store.commit('setPlayingState', !playing.value)
    }

    // 监听audio的暂停，修改playing的状态
    const pause = function() {
      store.commit('setPlayingState', false)
    }

    // 切换前一首歌
    const prevPlay = function() {
      const list = playList.value
      if (!songReady.value || !list.length) {
        return
      }
      // 如果只有一首歌 设置为循环播放
      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value - 1
        if (index === -1) {
          index = list.length - 1
        }
        store.commit('setCurrentIndex', index)
        // 如果当前是暂停的状态，切歌之后要播放
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
      }
    }
    // 切换后一首歌
    const nextPlay = function() {
      const list = playList.value
      if (!songReady.value || !list.length) {
        return
      }
      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value + 1
        if (index === playList.value.length) {
          index = 0
        }
        store.commit('setCurrentIndex', index)
        // 如果当前是暂停的状态，切歌之后要播放
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
      }
    }
    // 循环播放
    const loop = function() {
      const audioEl = audioRef.value
      // 设置当前的播放进度 单位为秒s
      audioEl.currentTime = 0
      audioEl.play()
    }

    // 在开始播放之前回触发该事件
    const ready = function() {
      if (songReady.value) {
        return
      }
      songReady.value = true
    }

    // 即使当前播放错误 也能切歌
    const error = function() {
      songReady.value = true
    }
    return {
      fillScreen,
      currentSong,
      audioRef,
      goBack,
      playIcon,
      togglePlay,
      pause,
      prevPlay,
      nextPlay,
      ready,
      disableCls,
      error,
      // mode
      modeIcon,
      changeMode,
      playMode,
      // favorite
      getFavoriteIcon,
      toggleFavorite
    }
  }
})
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background-color: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-top: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .bottom {
      width: 100%;
      position: absolute;
      bottom: 50px;
      .operators {
        display: flex;
        justify-content: space-around;
        align-items: center;
        .icon {
          // flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
  }
}
</style>