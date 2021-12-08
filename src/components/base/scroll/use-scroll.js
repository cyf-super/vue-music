import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'

import { onMounted, ref, onUnmounted } from 'vue'

BScroll.use(ObserveDOM)

export const useScroll = function(wrapperRef, options, emit) {
  const scroll = ref(null)

  onMounted(() => {
    const scrollVal = scroll.value = new BScroll(wrapperRef.value, {
      observeDOM: true,
      ...options
    })
    if (options.probeType > 0) {
      scrollVal.on('scroll', pos => {
        emit('scroll', pos)
      })
    }
  })

  onUnmounted(() => {
    scroll.value.destroy()
  })
}