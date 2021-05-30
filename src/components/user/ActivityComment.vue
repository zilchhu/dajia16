<template lang="pug">
a-comment
  template(#content)
    p {{comment.content}}
  activity-comment(v-if="comment.comments" v-for="com in comment.comments" :comment="com")
</template>

<script>
export default {
  name: 'activity-comment',
  props: {
    comment: Object
  }
}
</script>