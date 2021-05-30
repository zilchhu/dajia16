<template lang="pug">
.activity-comments
  a-input(v-model:value="value" size="small" style="width: 200px;" @pressEnter="add")
  activity-comment(v-for="comment in comments" :key="comment.content" :comment="comment")
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import ActivityComment from './ActivityComment'
export default {
  name: 'activity-comments',
  components: {
    ActivityComment
  },
  data() {
    return {
      comments: [
        {
          content: '3dskjahdkjasdaeq',
          comments: [
            {
              content: 'qweqweq23123'
            },
            {
              content: 'iodadnajk42343asda',
              comments: [
                {
                  content: '231231231231231'
                }
              ]
            }
          ]
        },
        {
          content: 'dadae3qw24234'
        }
      ],
      value: ''
    }
  },
  methods: {
    add() {
      this.comments = [...this.comments, { content: this.value, id: uuidv4() }]
    }
  }
}
</script>
