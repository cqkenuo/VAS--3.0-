<template>
  <div @click="handleScreenFull">
    <el-tooltip effect="dark" content="全屏模式" placement="top">
      <i class="iconfont icon-quanping1"></i>
    </el-tooltip>
  </div>
</template>

<script>
import screenfull from 'screenfull'

export default {
  name: 'fullscreen',
  props: {
    enabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      status: false
    }
  },
  methods: {
    handleScreenFull() {
      if (!this.enabled) return null
      if (!screenfull.enabled) {
        this.$message({
          message: 'fullscreen can not work',
          type: 'warning'
        })
        return false
      }
      screenfull.toggle()
    }
  }
}
</script>

<style lang="stylus" scoped>
i
  vertical-align middle
  cursor pointer
  font-size 2.5rem
  color #515151
  transition color .28s
  &:hover
    color #41b883
</style>
