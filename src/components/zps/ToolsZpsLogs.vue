<template lang="pug">
div(style="padding-right: 10px")
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
  )
    template(
      #filterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :style="`min-width: 160px; width: ${column.filterWidth || column.width || 220}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )

    template(#detail="{ text, record }")
      .detail-list
        .detail-item(v-for="prop in text", :key="prop.label") 
          span {{ prop.label }}
          span {{ prop.value }}

  .left-bottom-div(v-show="!loading", style="bottom: 10px")
    a-button(type="link", size="small", @click="initTable") 刷新
</template>

<script>
  import dayjs from "dayjs";
  import { message } from "ant-design-vue";
  import ins from "../../api/base4";
  import TableSelect from "../TableSelect";

  export default {
    name: "tools-zps-logs",
    components: {
      TableSelect,
    },
    data() {
      return {
        table: [],
        columns: [],
        loading: false,
        scrollY: 400,
      };
    },
    computed: {
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 100)
          .reduce((p, v) => p + v, 50);
      },
    },
    methods: {
      getColFilters(colName) {
        let distincts = Array.from(
          new Set(this.table.map((row) => row[colName] ?? ""))
        );

        if (colName == "时间") {
          distincts = Array.from(
            new Set(
              this.table.map((row) =>
                row[colName] ? dayjs(row[colName]).format("YYYY-MM-DD") : ""
              )
            )
          );
        }

        return distincts.map((col) => ({
          label: col || "",
          value: col || "",
        }));
      },
      initColumns() {
        const columnNames = ["账号", "姓名", "类型", "店铺", "详情", "时间"];
        let columns = columnNames.map((name) => {
          let column = {
            title: name,
            dataIndex: name,
            width: 70,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record[name] ?? "") == value,
          };

          if (name == "详情") {
            return { ...column, width: 200, slots: { customRender: "detail" } };
          }

          if (name == "店铺") {
            return { ...column, width: 140, filterWidth: 300 };
          }

          if (name == "时间") {
            return {
              ...column,
              width: 120,
              onFilter: (value, record) =>
                record[name]
                  ? dayjs(record[name]).isSame(dayjs(value), "day")
                  : "" == value,
              sorter: (a, b) => (dayjs(a.时间).isBefore(dayjs(b.时间)) ? -1 : 1),
            };
          }

          return column;
        });
        this.columns = columns;
      },
      initTable() {
        this.loading = true;
        ins({
          data: {
            event: "get-zps-ops",
          },
        })
          .then((res) => {
            this.table = res.ops;
          })
          .catch((err) => message.error(err))
          .finally(() => (this.loading = false));
      },
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 340;
      this.initColumns();
      this.initTable();
    },
  };
</script>

<style lang="sass" scoped>
.detail-list
  display: flex
  flex-direction: column
  max-width: 300px
  row-gap: 2px

.detail-item
  display: flex
  justify-content: space-between
</style>