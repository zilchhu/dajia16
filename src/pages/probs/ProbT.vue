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
import Probs from '../../api/probs'
import { message } from 'ant-design-vue'

export default {
  name: 'ProbT',
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 900
    }
  },
  computed: {
    columns() {
      return [
        {
          title: '门店id',
          dataIndex: '门店id',
          width: 90,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.门店id == value
        },
        {
          title: '门店',
          dataIndex: '门店',
          width: 250,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.门店 == value
        },
        {
          title: '分类',
          dataIndex: '分类',
          width: 140,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.分类 == value
        },
        {
          title: '品名',
          dataIndex: '品名',
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.品名 == value
        },
        {
          title: '原价',
          dataIndex: '原价',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.原价) - this.toNum(b.原价)
        },
        {
          title: '折扣价',
          dataIndex: '折扣价',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.折扣价) - this.toNum(b.折扣价)
        },
        {
          title: '餐盒费',
          dataIndex: '餐盒费',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.餐盒费) - this.toNum(b.餐盒费)
        },
        {
          title: '起购数',
          dataIndex: '起购数',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.起购数) - this.toNum(b.起购数)
        },
        {
          title: '销量',
          dataIndex: '销量',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.销量) - this.toNum(b.销量)
        },
        {
          title: '上下架状态',
          dataIndex: '上下架状态',
          width: 120,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.上下架状态 == value
        }
      ]
    }
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map(row => row[colName]))).map(col => ({
        text: col,
        value: col
      }))
    },
    toNum(str) {
      try {
        return parseFloat(str)
      } catch (error) {
        return 0
      }
    },
    fetchTable() {
      this.loading = true
      new Probs()
        .single('t')
        .then(res => {
          this.table = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    }
  },
  created() {
    this.scrollY = document.body.clientHeight - 176
    this.fetchTable()
  }
}
</script>
