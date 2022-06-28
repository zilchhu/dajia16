<template lang="pug">
a-table(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
  :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
  size="small" :scroll="{y: scrollY}")

  template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
    a-row(type="flex")
      a-col(flex="auto")
        a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${column.width || 220}px;`")
          a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      a-col(flex="60px")
        a-button(type="link" @click="confirm") confirm
        br
        a-button(type="link" @click="clearFilters") reset
</template>

<script>
  import Probs from "../../api/probs"
  import { message } from "ant-design-vue"

  export default {
    name: "ProbM",
    data() {
      return {
        table: [],
        loading: false,
        scrollY: 900,
      }
    },
    computed: {
      columns() {
        return [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺id == value,
          },
          {
            title: "店名",
            dataIndex: "店铺名称",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺名称 == value,
          },
          {
            title: "配送方式",
            dataIndex: "配送方式",
            width: 120,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.配送方式 == value,
          },
          {
            title: "活动状态",
            dataIndex: "活动状态",
            width: 120,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.活动状态 == value,
          },
          {
            title: "活动规则",
            dataIndex: "活动规则",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.活动规则 == value,
          },
          {
            title: "配送费",
            dataIndex: "配送费",
            width: 100,
            sorter: (a, b) => this.toNum(a.配送费) - this.toNum(b.配送费),
          },
          {
            title: "起送价",
            dataIndex: "起送价",
            width: 100,
            sorter: (a, b) => this.toNum(a.起送价) - this.toNum(b.起送价),
          },
          {
            title: "活动时间",
            dataIndex: "活动时间",
            slots: { filterDropdown: "filterDropdown" },
            width: 200,
            onFilter: (value, record) => record.活动时间 == value,
          },
        ]
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName]))).map((col) => ({
          text: col,
          value: col,
        }))
      },
      toNum(str) {
        try {
          let f = parseFloat(str)
          if (isNaN(f)) return 0
          return f
        } catch (err) {
          return 0
        }
      },
      fetchTable() {
        this.loading = true
        new Probs()
          .single("m")
          .then((res) => {
            this.table = res
            this.loading = false
          })
          .catch((err) => {
            message.error(err)
            this.loading = false
          })
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 204
      this.fetchTable()
    },
  }
</script>
