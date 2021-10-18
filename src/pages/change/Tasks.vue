<template lang="pug">
div.tasks
  h4 任务日志
  div.task-list
    a(href="http://192.168.3.3:8080/logs/20211017_mt1.txt") 美团14.8+1 20211017
    a(href="http://192.168.3.3:8080/logs/20211017_mt2.txt") 美团13.8+1 20211017
    a(href="http://192.168.3.3:8080/logs/20211017_elm1.txt") 饿了么14.8+1 20211017
    a(href="http://192.168.3.3:8080/logs/20211017_elm2.txt") 饿了么13.8+1 20211017
</template>


<script>
export default {
  name: 'tasks'
}
</script>

<style lang="sass" scoped>
.tasks
  padding: 20px 30px

.task-list
  display: flex
  flex-direction: column
  row-gap: 0.8em
</style>