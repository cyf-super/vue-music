<template lang="pug">
.suggest(
  ref="rootRef"
  v-loading:[loadingText]="loading"
  v-no-result:[noResultText]="noResult"
)
  ul.suggest-list
    li.suggest-item(
      v-if="singer"
      @click="selectSinger(singer)"
      )
      .icon
        i.icon-mine
      .name
        p.text {{ singer.name }}
    li.suggest-item(
      v-for="song in songs"
      :key="song.id"
      @click="selectSong(song)"
    )
      .icon
        i.icon-music
      .name
        p.text {{ song.singer }}-{{ song.name }}
    .suggest-item(
      v-loading:[loadingText]="pullUpLoading"
    )
</template>

<script>
import { computed, nextTick, ref, watch } from 'vue'
import { search } from '@/service/search.js'
import { processSongs } from '@/service/song.js'
import usePullUpLoad from './use-pull-up-load.js'

export default {
  name: 'suggest',
  props: {
    query: String,
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  emit: ['select-song', 'select-singer'],
  setup(props, { emit }) {
    const singer = ref(null)
    const songs = ref([])
    const hasMore = ref(true)
    const page = ref(1)
    const loadingText = ref('')
    const noResultText = ref('抱歉，暂无搜索结果')
    const manualLoading = ref(false)

    const loading = computed(() => !singer.value && !songs.value.length)
    const loadingStyle = computed(() => {
      if (loading.value) {
        return {
          paddingTop: '200px'
        }
      }
      return ''
    })

    const noResult = computed(() => {
      return !singer.value && !songs.value.length && !hasMore.value
    })

    const pullUpLoading = computed(() => {
      return isPullUpLoad.value && hasMore.value
    })

    const preventPullUpLoad = computed(() => {
      return loading.value || manualLoading.value
    })

    watch(() => props.query, async (newQuery) => {
      if (!newQuery) {
        return
      }
      await searchFirst()
    })

    const { rootRef, isPullUpLoad, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)
    async function searchFirst() {
      if (!props.query) {
        return
      }
      page.value = 1
      songs.value = []
      singer.value = null
      hasMore.value = true

      const result = await search(props.query, page.value, props.showSinger)
      songs.value = await processSongs(result.songs)
      singer.value = result.singer
      hasMore.value = result.hasMore
      await nextTick()
      await makeItScrollable()
    }

    async function searchMore() {
      if (!hasMore.value || !props.query) {
        return
      }
      page.value++
      const result = await search(props.query, page.value, props.showSinger)
      songs.value = songs.value.concat(await processSongs(result.songs))
      hasMore.value = result.hasMore
      await nextTick()
      await makeItScrollable()
    }

    async function makeItScrollable() {
      // 数据不到一屏继续加载数据
      if (scroll.value.maxScrollY >= -1) {
        manualLoading.value = true
        await searchMore()
        manualLoading.value = false
      }
    }

    const selectSong = function(song) {
      emit('select-song', song)
    }

    const selectSinger = function(singer) {
      emit('select-singer', singer)
    }
    return {
      songs,
      singer,
      loadingText,
      loading,
      loadingStyle,
      noResult,
      noResultText,
      // usePullUpLoad
      rootRef,
      isPullUpLoad,
      pullUpLoading,
      selectSong,
      selectSinger
    }
  }
}
</script>

<style lang="scss" scoped>
.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: 14px;
          color: $color-text-d;
        }
      }
      .name {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-d;
        overflow: hidden;
        .text {
          @include no-wrap();
        }
      }
    }
  }
}
</style>
