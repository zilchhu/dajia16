<template lang="pug">
.detail
  a-spin(:spinning="loading")
    div(style="white-space: pre-wrap") {{ detail }}

  div(v-if="!loading", style="margin-type: 12px")
    a-button(type="link", @click="fetchFoodDetail") 刷新
</template>

<script>
import { message } from "ant-design-vue"
import baseFetch from "../../api/base"

export default {
  name: "tools-food-detail",
  props: ["taskId", "i"],
  data() {
    return {
      loading: false,
      detail: "",
    }
  },
  methods: {
    fetchFoodDetail() {
      console.log("detail", this.taskId, this.i)
      if (this.taskId == null || this.i == null) return
      this.loading = true

      baseFetch({
        url: `/v1/tools/update-foods/tasks/${this.taskId}/foods/${this.i}`
      })
        .then((res) => {
          this.detail = res.detail
          this.loading = false
        })
        .catch((e) => {
          message.error(e.message)
          this.loading = false
        })
    },
  },
  created() {
    this.fetchFoodDetail()
  },
  watch: {
    'taskId,i'() {
      this.fetchFoodDetail()
    },
  }
}
</script>

<style lang="sass" scoped>
section
  .title
    font-size: 1.2em
    .body
      .field
        display: flex
        align-items: flex-start
        column-gap: 4px
      .label
        width: 6em
        flex-shrink: 1
</style>
