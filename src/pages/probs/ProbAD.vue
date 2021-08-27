<template lang="pug">
a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
  :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
  size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

  template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
    table-select(:style="`min-width: 160px; width: ${column.width + 50 || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
      :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

</template>

<script>
import Probs from '../../api/probs'
import { message } from 'ant-design-vue'
import TableSelect from '../../components/TableSelect'

export default {
  name: 'ProbAC',
  components: {
    TableSelect
  },
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
          dataIndex: 'shop_id',
          width: 90,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.shop_id == value
        },
        {
          title: '门店',
          dataIndex: 'shop_name',
          width: 250,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.shop_name == value
        },
        {
          title: 'packName',
          dataIndex: 'packName',
          slots: { filterDropdown: 'filterDropdown' },
          width: 150,
          onFilter: (value, record) => record.packName == value
        },
        {
          title: '示例单号',
          dataIndex: '示例单号',
          width: 250,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.示例单号 == value
        },
        {
          title: '用户支付配送费',
          dataIndex: '用户支付配送费',
          align: 'right',
          width: 130,
          sorter: (a, b) => this.toNum(a.用户支付配送费) - this.toNum(b.用户支付配送费)
        },
        {
          title: '商家支付配送费',
          dataIndex: '商家支付配送费',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.商家支付配送费) - this.toNum(b.商家支付配送费)
        }
      ]
    }
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map(row => row[colName] || '')))
        .sort()
        .map(col => ({
          label: col,
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
        .single('ad')
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
    this.scrollY = document.body.clientHeight - 204
    this.fetchTable()
  }
}
</script>
