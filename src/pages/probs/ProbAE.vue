<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
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
      template(v-if="column.dataIndex == 'handle'")
        a-input(
          :value="text",
          @change="(e) => handleChange(e.target.value, record)",
          size="small"
        )
      template(v-else-if="column.dataIndex == '活动规则'")
        span.pre {{ text }}

  .left-bottom-div(v-show="!loading")
    a-button(type="link", size="small", @click="fetchTable") 刷新
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 导出
    a(
      v-show="tableUrl",
      :href="`http://192.168.3.3:9005/${tableUrl}`",
      target="_blank"
    ) 下载
</template>

<script>
  import Probs from "../../api/probs";
  import { message } from "ant-design-vue";
  import dayjs from "dayjs";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "ProbAE",
    components: {
      TableSelect,
    },
    data() {
      return {
        table: [],
        loading: false,
        scrollY: 900,
        debounce_save: null,
        exporting: false,
        tableUrl: null,
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "店铺编号",
            dataIndex: "店铺编号",
            width: 110,
            customFilterDropdown: true,
            onFilter: (value, record) => record.店铺编号 == value,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
            customFilterDropdown: true,
            onFilter: (value, record) => record.店铺名称 == value,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
            customFilterDropdown: true,
            onFilter: (value, record) => record.平台 == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 80,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.real_shop_name ?? "") == value,
          },
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.责任人 ?? "") == value,
          },
          {
            title: "活动类型",
            dataIndex: "活动类型",
            width: 130,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.活动类型 ?? "") == value,
          },
          {
            title: "活动规则",
            dataIndex: "活动规则",
            customFilterDropdown: false,
            onFilter: (value, record) => (record.活动规则 ?? "") == value,
          },
          {
            title: "结束时间",
            dataIndex: "结束时间",
            width: 200,
            customFilterDropdown: true,
            onFilter: (value, record) => record.结束时间 == value,
            sorter: (a, b) =>
              dayjs(a.结束时间).isBefore(dayjs(b.结束时间)) ? -1 : 1,
          },
          {
            title: "处理",
            dataIndex: "handle",
            customFilterDropdown: true,
            onFilter: (value, record) => (record.handle ?? "") == value,
          },
        ];
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName] ?? "")))
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
      },
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      fetchTable() {
        this.loading = true;
        new Probs()
          .single("ae")
          .then((res) => {
            this.table = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      handleChange(value, record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          target["handle"] = value;
          this.debounce_save(record);
        }
      },
      save(record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          new Probs()
            .save("ae", record.key, target["handle"])
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              message.error(err);
            });
        }
      },
      transformTable() {
        return this.table.map((row) =>
          this.columns.reduce(
            (p, c) => ({ ...p, [c.title]: row[c.dataIndex] }),
            {}
          )
        );
      },
      exportTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.transformTable(),
        });
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 204;
      this.debounce_save = this.debounce(this.save);
      this.fetchTable();
    },
    mounted() {
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });
    },
  };
</script>

<style lang="sass" scoped>
.pre
  white-space: pre-wrap
</style>
