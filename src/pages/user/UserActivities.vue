<template lang="pug">
a-list(:dataSource="activities" :bordered="false" :split="false")
  template(#renderItem="{item, index}")
    activity-card(:activity="{...item, index}")
  //- template(#loadMore)
  //-   .center
  //-     a-button(@click="load_more" size="small" type="link") load more
</template>

<script>
import ActivityCard from '../../components/user/ActivityCard'

export default {
  name: 'user-activities',
  components: {
    ActivityCard
  },
  props: {
    activities: Array
  },
  methods: {
    load_more() {
      this.$emit('fetchMore')
    }
  }
}
</script>

<style lang="sass" scoped>
.center
  display: flex
  height: 40px
  justify-content: center
</style>

