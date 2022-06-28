<template lang="pug">
.tools-food
  .header
    .title 商品差异
    .controls
      a-button(size="small", @click="fetchTable") 刷新列表

  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ pageSize: 50 }",
    size="small",
    :scroll="{ y: scrollY }"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="table",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == '字段差异'")
        .field-diffs
          .field-diff(v-for="diff in text")
            .field-values
              .field-name {{ diff.zhName }}
              span.field-value.left-value(
                :class="{ updated: diff.changeType.match(/updated|inserted/), 'food-name': diff.name == 'name' }"
              ) {{ diff.leftValue }}
              span.field-value.right-value(
                :class="{ updated: diff.changeType.match(/updated|inserted/), 'food-name': diff.name == 'name' }"
              ) {{ diff.rightValue }}
      template(v-else-if="column.dataIndex == '恢复结果'")
        div(v-if="text", style="overflow: hidden", :title="text")
          a-tooltip
            template(#title)
              div(v-if="text == '失败'") {{ record.result.error }}
              .success-res(v-else) {{ getResultDetail(record.result) }}

            a-tag(:color="text == '失败' ? 'error' : 'success'") {{ text }}
      template(v-else-if="column.title == '操作'")
        a-button(
          type="link",
          size="small",
          @click="unchangeFood(record)",
          :loading="record.unchangeLoading"
        ) 恢复
</template>

<script>
  import app from "apprun";
  import dayjs from "dayjs";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";

  function throttle(fn, wait) {
    let timer = null;
    return function () {
      let context = this;
      let args = arguments;

      if (!timer) {
        timer = setTimeout(function () {
          fn.apply(context, args);
          timer = null;
        }, wait);
      }
    };
  }

  export default {
    name: "tool-food-diff",
    components: {
      TableSelect,
    },
    data() {
      return {
        bodyRect: { width: 900, height: 800 },
        columns: [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 100,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.店铺id ?? "") == value,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 200,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.店铺名称 ?? "") == value,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 100,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.负责人 ?? "") == value,
          },
          {
            title: "字段差异",
            dataIndex: "字段差异",
            customFilterDropdown: true,
            onFilter: (value, record) => (record.字段差异 ?? "") == value,
          },
          {
            title: "日期",
            dataIndex: "日期",
            width: 100,
            onFilter: (value, record) => (record.日期 ?? "") == value,
          },
          {
            title: "恢复结果",
            dataIndex: "恢复结果",
            width: 100,
            onFilter: (value, record) => (record.恢复结果 ?? "") == value,
          },
          {
            title: "操作",
            dataIndex: "key",
            width: 100,
          },
        ],
        table: [],
        loading: false,
        throtFetchTable: () => {},
      };
    },
    computed: {
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 200)
          .reduce((p, v) => p + v, 0);
      },
      scrollY() {
        return this.bodyRect.height - 204;
      },
      scroll() {
        return { y: this.scrollY, x: this.scrollX };
      },
    },
    methods: {
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      getResultDetail(result) {
        if (result?.result == null) return "";
        return JSON.stringify(result.result, null, 2);
      },
      fetchTable() {
        this.loading = true;
        app.run("ws://", "get-food-diffs");
      },
      unchangeFood(rec) {
        let i = this.table.findIndex((r) => r.key == rec.key);
        this.table[i].unchangeLoading = true;
        app.run("ws://", "unchange-food", { id: rec.id });
      },
      cancelTask(id) {
        // app.run("ws://", "cancel-food-task", { id });
      },
      onGetFoodDiffs(state) {
        if (state.error) message.error(state.error);
        this.table = state.result.diffs;
        this.loading = false;
      },
      onUploadTable(state) {
        this.fileTable = state.jsonTable;
      },
      onUnchangeFood(state) {
        if (this.throtFetchTable) this.throtFetchTable();
      },
    },
    created() {
      console.log("tool-food created!");
      this.throtFetchTable = throttle(this.fetchTable, 800);
      app.on("get-food-diffs-res", this.onGetFoodDiffs.bind(this));
      app.on("unchange-food-res", this.onUnchangeFood.bind(this));

      setTimeout(() => {
        this.fetchTable();
      }, 600);
    },
    mounted() {
      this.bodyRect = document.body.getBoundingClientRect();
    },
    unmounted() {
      console.log("tool-food unmounted!");
      app.off("get-food-diffs-res", this.onGetFoodDiffs.bind(this));
      app.off("unchange-food-res", this.onUnchangeFood.bind(this));
    },
  };
</script>


<style lang="sass" scoped>
.tools-food
  padding: 20px
  margin: 0 auto

  .header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 6px

    .title
      font-size: 1.1em
      font-weight: bold

    .controls
      display: flex
      align-items: center
      column-gap: 6px

.updown-table
  display: flex
  align-items: center
  column-gap: 18px

.exec-form-item
  display: flex
  align-items: center

.field-name
  min-width: 6em
  // font-weight: bold

.field-values
  display: flex

.field-value
  flex: 1

.field-value.food-name
  font-weight: bold

.field-value.left-value.updated
  background-color: #EF4444

.field-value.right-value.updated
  background-color: #10B981
</style>