<template lang="pug">
.loading
  .loading-content
    img(src='./loading.gif' width="24" height="24")
    p.desc {{ title }}
</template>

<script>
export default {
  name: 'loading',
  data() {
    return {
      title: '正在载入中...'
    }
  },
  methods: {
    setTitle(title) {
      this.title = title
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  &-content {
    text-align: center;
    .desc {
      line-height: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
    }
  }
}
</style>
