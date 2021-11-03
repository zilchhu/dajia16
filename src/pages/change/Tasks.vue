<template lang="pug">
.tasks
  .header
    h4 任务日志
    .header-controls
      a-button(type="link", size="small", @click="fetchLogIndex") 
        SyncOutlined
        span(style="margin-left: 4px") 刷新

  a-spin(:spinning="indexLoading")
    .task-list
      .task-list-item(v-for="item in index", :key="item.filename") 
        a(:href="item.url" target="_blank") {{ item.title }}
</template>


<script>
  import query from "../../api/query";
  import { message } from "ant-design-vue";
  import { SyncOutlined } from "@ant-design/icons-vue";

  export default {
    name: "tasks",
    components: {
      SyncOutlined,
    },
    data() {
      return {
        index: [],
        indexLoading: false,
      };
    },
    methods: {
      fetchLogIndex() {
        this.indexLoading = true;
        query("get-task-log-index")
          .then((res) => (this.index = res))
          .catch((err) => message.error(err))
          .finally(() => (this.indexLoading = false));
      },
    },
    mounted() {
      this.fetchLogIndex();
    },
  };
</script>



<style lang="sass" scoped>
.tasks
  padding: 20px 30px

.header
  display: flex
  justify-content: space-between
  align-items: center

.header-controls
  transform: scale(.82)

.task-list
  columns: 2

.task-list-item
  padding: 2px 0
</style>

