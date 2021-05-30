<template lang="pug">
template(v-if="!table1")
  a-spin
template(v-else-if="table1.err")
  a-alert(type="error" :message="table1.err" show-icon closable)
template(v-else-if="!table1.data")
  a-empty
template(v-else)
  a-table(:columns="cols" :data-source="table1.data" rowKey="shop_id" @expand="expand" :pagination="false" size="small" :scroll="{y: scrollY}")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      a-input-search(:value="selectedKeys[0]" @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])" @search="confirm" style="width: 200px;")
      svg(class="icon icon-reset" aria-hidden="true" @click="clearFilters")
        use(xlink:href="#icon-editdiameterbeifen25x")

    template(#income="{text, record}")
      .cell(:class="{unsatisfied: isIncome(text, record)}") {{text}}
    template(#incomeAvg="{text, record}")
      .cell(:class="{unsatisfied: isIncomeAvg(text, record)}") {{text}}
    template(#consumeRatio="{text, record}")
      .cell(:class="{unsatisfied: isConsumeRatio(text, record)}") {{text}}
    template(#costRatio="{text, record}")
      .cell(:class="{unsatisfied: isCostRatio(text, record)}") {{text}}
    template(#settlea30="{text, record}")
      .cell(:class="{unsatisfied: isSettlea30(text, record)}") {{text}}
    template(#status="{text, record}")
      a-tag(:color="status(text, record).color") {{status(text, record).text}}

    template(#expandedRowRender="{record}")
      a-tabs
        a-tab-pane(v-if="unSatisfies(record).length > 0" key="q&a" tab="方案")
          a-list(:grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }" :data-source="unSatisfies(record)")
            template(#renderItem="{ item, index }")
              a-list-item
                a-card
                  a-statistic(:title="item.title" :value="item.value" :value-style="{ color: '#fa541c' }")
                    template(#suffix)
                      span.threshold / {{item.threshold}}
          a-card(v-if="!record.op_id" title="plan" :bordered="false")
            a-comment
              template(#content)
                hello-form(:id="record.id" :shopId="record.shop_id" :problem="unSatisfiesProblems(record)" :persons="table1Persons" @submitPlan="onSubmitPlan")
          a-divider
          a-card
            a-table(:columns="cols3" :data-source="planTable.data" rowKey="id" :loading="planTableLoading" size="small")      
            
        //- description panel
        a-tab-pane(key="description" tab="详情")
          a-descriptions(size="small" :column="{ xxl: 5, xl: 4, lg: 4, md: 4, sm: 3, xs: 1 }")
            a-descriptions-item(v-for="key in Object.keys(record)" :key="key" :label="key") {{record[key]}}
          a-card
            a-table(:columns="cols3" :data-source="planTable.data" rowKey="id" :loading="planTableLoading" size="small")
         
        //- history data panel
        a-tab-pane(key="history", tab="历史数据")
          a-table(:columns="cols2" :data-source="historyTable.data" rowKey="date" :loading="historyTableLoading" :pagination="false" size="small")
             template(#expandedRowRender="{record}")
               a-descriptions(size="small" :column="{ xxl: 5, xl: 4, lg: 4, md: 4, sm: 3, xs: 1 }")
                 a-descriptions-item(v-for="key in Object.keys(record)" :key="key" :label="key") {{record[key]}}
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { cols2, cols3 } from './App.model'
import { getHistoryTable, getPlans } from './api'
import { formatTable, formatTable2 } from './store'
import HelloForm from './components/HelloForm'

export default {
  name: 'App',
  components: {
    HelloForm
  },
  data() {
    return {
      cols2,
      cols3,
      searchText: '',
      historyTable: '',
      historyTableLoading: true,
      planTable: '',
      planTableLoading: true,
      form: {
        name: '',
        plan: '',
        problem: ''
      },
      scrollY: 1000
    }
  },
  computed: {
    ...mapGetters(['table1', 'table1Persons']),
    cols() {
      return [
        {
          title: '城市',
          dataIndex: 'city',
          width: 70,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.city.includes(value.trim())
        },
        {
          title: '负责',
          dataIndex: 'person',
          width: 70,
          filters: [],
          filterMultiple: true,
          onFilter: (value, record) => record.platform == value
        },
        {
          title: '物理店',
          dataIndex: 'real_shop',
          width: 90,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.real_shop.includes(value.trim())
        },
        {
          title: '门店id',
          dataIndex: 'shop_id',
          width: 100,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.shop_id.includes(value.trim())
        },
        {
          title: '店名',
          dataIndex: 'shop_name',
          width: 260,
          slots: { filterDropdown: 'filterDropdown' },
          onFilter: (value, record) => record.shop_name.includes(value.trim())
        },
        {
          title: '平台',
          dataIndex: 'platform',
          width: 80,
          filters: [
            { text: '美团', value: '美团' },
            { text: '饿了么', value: '饿了么' }
          ],
          filterMultiple: true,
          onFilter: (value, record) => record.platform == value
        },
        {
          title: '三方配送',
          dataIndex: 'third_send',
          align: 'right',
          width: 100,
          sorter: (a, b) => a.income - b.income
          // width: 100
        },
        {
          title: '收入',
          dataIndex: 'income',
          align: 'right',
          width: 100,
          slots: { customRender: 'income' },
          sorter: (a, b) => a.income - b.income
          // width: 100
        },
        {
          title: '平均收入',
          dataIndex: 'income_avg',
          align: 'right',
          width: 100,
          slots: { customRender: 'incomeAvg' },
          sorter: (a, b) => a.income_avg - b.income_avg
        },
        // {
        //   title: 'income_sum',
        //   dataIndex: 'income_sum',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'cost',
        //   dataIndex: 'cost',
        //   align: 'right',
        //   width: 100
        //   // width: 100
        // },
        // {
        //   title: 'cost_avg',
        //   dataIndex: 'cost_avg',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'cost_sum',
        //   dataIndex: 'cost_sum',
        //   align: 'right',
        //   width: 100
        // },
        {
          title: '成本比例',
          dataIndex: 'cost_ratio',
          align: 'right',
          width: 100,
          slots: { customRender: 'costRatio' },
          sorter: (a, b) => a.cost_ratio - b.cost_ratio
        },
        // {
        //   title: 'cost_sum_ratio',
        //   dataIndex: 'cost_sum_ratio',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'consume',
        //   dataIndex: 'consume',
        //   align: 'right',
        //   width: 100
        //   // width: 100
        // },
        // {
        //   title: 'consume_avg',
        //   dataIndex: 'consume_avg',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'consume_sum',
        //   dataIndex: 'consume_sum',
        //   align: 'right',
        //   width: 100
        // },
        {
          title: '推广比例',
          dataIndex: 'consume_ratio',
          align: 'right',
          width: 100,
          slots: { customRender: 'consumeRatio' },
          sorter: (a, b) => a.consume_ratio - b.consume_ratio
        },
        // {
        //   title: 'consume_sum_ratio',
        //   dataIndex: 'consume_sum_ratio',
        //   align: 'right',
        //   width: 100
        // },
        {
          title: '比30日',
          dataIndex: 'settlea_30',
          align: 'right',
          width: 100,
          slots: { customRender: 'settlea30' },
          sorter: (a, b) => a.settlea_30 - b.settlea_30
        },
        {
          title: '比昨日',
          dataIndex: 'settlea_1',
          align: 'right',
          width: 100,
          sorter: (a, b) => a.settlea_1 - b.settlea_1
        },
        {
          title: '比上周',
          dataIndex: 'settlea_7',
          align: 'right',
          width: 100,
          sorter: (a, b) => a.settlea_7 - b.settlea_7
        },
        {
          title: '状态',
          dataIndex: 'op_id',
          align: 'center',
          width: 70,
          slots: { customRender: 'status' }
        },
        // {
        //   title: 'income_score',
        //   dataIndex: 'income_score',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'cost_score',
        //   dataIndex: 'cost_score',
        //   align: 'right',
        //   width: 100
        // },
        // {
        //   title: 'consume_score',
        //   dataIndex: 'consume_score',
        //   align: 'right',
        //   width: 100
        // },
        {
          title: '总分',
          dataIndex: 'score',
          align: 'right',
          width: 100,
          sorter: (a, b) => a.score - b.score
        },
        {
          title: '日期',
          dataIndex: 'date',
          align: 'right',
          width: 100
        }
      ]
    }
  },
  methods: {
    expand(expanded, record) {
      this.historyTableLoading = true
      getHistoryTable(2, record.shop_id, 7)
        .then(res => formatTable(res))
        .then(res => {
          this.historyTable = res
          this.historyTableLoading = false
        })
      this.renderPlans(record.shop_id)
    },
    isIncome(text, record) {
      text = parseFloat(text)
      if (record.platform == '美团') return text < 1500
      else if (record.platform == '饿了么') return text < 1000
      return false
    },
    isIncomeAvg(text) {
      text = parseFloat(text)
      return text < 1500
    },
    isConsumeRatio(text) {
      text = parseFloat(text)
      return text > 5
    },
    isCostRatio(text) {
      text = parseFloat(text)
      return text > 50
    },
    isSettlea30(text) {
      text = parseFloat(text)
      return text < 70
    },
    unSatisfies(record) {
      const { income, income_avg, consume_ratio, cost_ratio, settlea_30, platform } = record
      let list = []
      if (this.isIncome(income, record))
        list.push({
          title: 'income',
          value: income,
          threshold: platform == '美团' ? '1500' : '1000'
        })
      if (this.isIncomeAvg(income_avg))
        list.push({
          title: 'income_avg',
          value: income_avg,
          threshold: '1500',
          problem: 'low_income'
        })
      if (this.isConsumeRatio(consume_ratio))
        list.push({
          title: 'consume_ratio',
          value: consume_ratio,
          threshold: '5%',
          problem: 'high_consume'
        })
      if (this.isCostRatio(cost_ratio))
        list.push({
          title: 'cost_ratio',
          value: cost_ratio,
          threshold: '50%',
          problem: 'high_cost'
        })
      if (this.isSettlea30(settlea_30))
        list.push({
          title: 'settlea_30',
          value: settlea_30,
          threshold: '70%',
          problem: 'low_income'
        })
      return list
    },
    unSatisfiesProblems(record) {
      return Array.from(new Set(this.unSatisfies(record).map(v => v.problem))).join(' ')
    },
    isUnSubmit(id) {
      return !this.plans.includes(id)
    },
    status(text, record) {
      if (this.unSatisfies(record).length == 0) return { color: 'success', text: 'success' }
      else if (this.unSatisfies(record).length > 0 && !text) return { color: 'warning', text: '未提交' }
      else return { color: 'processing', text: '已提交' }
    },
    renderPlans(shop_id) {
      getPlans(shop_id)
        .then(res => formatTable2(res))
        .then(res => {
          this.planTable = res
          this.planTableLoading = false
        })
    },
    onSubmitPlan(newPlan) {
      this.renderPlans(newPlan.shop_id)
      this.updateTable(newPlan)
    },
    // rowClassName(record) {
    //   const is_ =
    //     this.isSr(record.收入, record) ||
    //     this.isWldddpgsr(record.物理店单店平均收入) ||
    //     this.isTgfbl(record.推广费比例) ||
    //     this.isCbbl(record.成本比例) ||
    //     this.isSr30(record.当日收入与30日平均收入比值)
    //   return is_ ? 'unsatisfied-row': 'satisfied-row'
    ...mapActions(['initTable']),
    ...mapMutations(['updateTable'])
  },
  mounted() {
    this.scrollY = document.body.clientHeight
    this.initTable()
  }
}
</script>

<style lang="sass" scoped>
.cell
  display: inline-block
  width: 100%
  text-align: right

.unsatisfied
  color: #fa541c

.threshold
  color: black

.unsatisfied-row
  border-color: #fff2e8
  background-color: #fff2e8

.satisfied-row
  background-color: #f6ffed

.icon-reset
  margin: 0 6px
</style>
