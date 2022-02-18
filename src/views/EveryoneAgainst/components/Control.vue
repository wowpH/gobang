<template>
  <div class="control">
    <q-btn color="primary" label="Primary" />
    <!-- <button @click="begin" :disabled="playing">开始</button> -->
    <!-- <button @click="begin" :disabled="!playing">重新开始</button> -->
    <!-- <button @click="end" :disabled="!playing">结束</button> -->
    <!-- <div class="player">
      {{ player === '1' ? '轮到黑棋落子！' : '轮到白棋落子！' }}
    </div>
    <div class="tip">{{ tip }}</div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      isBegin: false,
    }
  },
  methods: {
    begin() {
      this.$emit('begin')
    },
  },
}
</script>

<style></style>
