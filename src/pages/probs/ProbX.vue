<template lang="pug">
a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
  :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
  size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

  template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
    table-select(:style="`min-width: 160px; width: ${column.width + 50 || 400}px;`" :filterOptions="getColFilters(column.dataIndex)" 
      :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")
  
  template(#handle="{text, record}")
    a-input(:value="text" @change="e => handleChange(e.target.value, record)" size="small")
</template>

<script>
import Probs from '../../api/probs'
import { message } from 'ant-design-vue'
import TableSelect from '../../components/TableSelect'

export default {
  name: 'ProbX',
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
          title: '店铺id',
          dataIndex: '店铺id',
          width: 90,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.店铺id == value
        },
        {
          title: '店名',
          dataIndex: '店名',
          width: 250,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.店名 == value
        },
        {
          title: '物理店',
          dataIndex: '物理店',
          width: 140,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.物理店 == value
        },
        {
          title: '平台',
          dataIndex: '平台',
          width: 70,
          filters: [
            { text: '美团', value: '美团' },
            { text: '饿了么', value: '饿了么' }
          ],
          filterMultiple: true,
          onFilter: (value, record) => record.平台 == value
        },
        {
          title: '责任人',
          dataIndex: '责任人',
          width: 90,
          slots: { filterDropdown: 'filterDropdown', customRender: 'person' },
          onFilter: (value, record) => record.责任人 == value
        },
        {
          title: '商品分类',
          dataIndex: '商品分类',
          width: 140,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.商品分类 == value
        },
        {
          title: '商品名称',
          dataIndex: '商品名称',
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.商品名称 == value
        },
        {
          title: '商品spu码',
          dataIndex: '商品spu码',
          align: 'right',
          width: 180,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.商品spu码 == value
        },
        {
          title: '处理',
          dataIndex: 'handle',
          filters: [
            { text: '已处理', value: '' },
            { text: '未处理', value: '1' }
          ],
          filterMultiple: true,
          slots: { customRender: 'handle' },
          onFilter: (value, record) => (record?.handle == null) == Boolean(value)
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
        .single('x')
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
