<template lang="pug">
.column-filter-color-opts
  a-checkbox(:checked="colorAllChecked" :indeterminate="colorIndeterminate" @change="onColorFilterCheckAll") 全选
  .filter-opt-list
    .color-filter-opt(v-for="opt in colorFilterOptions" :key="opt.color") 
      a-checkbox(
        :checked="colorFilters.includes(opt.color)",
        @change="(e) => onColorFilterCheck(e.target.checked, opt)"
      )
        span.color-filter-opt-color(:style="`background: ${opt.color}`") {{ opt.color }}
        span.filter-opt-count （{{ opt.count }}）
      .filter-addon(@click="onFilterOnly(opt)") 仅筛选此项
</template>

<script>
function groupBy(arr, key) {
  const groups = Array.from(new Set(arr.map(v => v[key])))
  return groups.map(group => ({ group, members: arr.filter(v => v[key] == group) }))
}

export default {
  name: "column-filter-text-opts",
  props: ['column', 'table', 'currentTable', 'filterOptions', 'filterPane', 'selectedKeys', 'setSelectedKeys', 'resetToken', 'delayConfirm'],
  data() {
    return {
      colorFilters: []
    }
  },
  computed: {
    columnKey() {
      return this.column.key
    },
    filterPaneKey() {
      return this.filterPane.key
    },
    colorFilterOptions() {
      return groupBy(this.filterOptions, 'color')
        .map(({ group, members }) => ({ color: group, values: members.map(m => m.value), count: members.length }))
    },
    colorIndeterminate() {
      return !!this.colorFilters.length && this.colorFilters.length < this.colorFilterOptions.length
    },
    colorAllChecked() {
      return this.colorFilters.length == this.colorFilterOptions.length
    }
  },
  methods: {
    onColorFilterCheck(checked, opt) {
      if (checked) this.colorFilters = this.colorFilters.concat([opt.color])
      else this.colorFilters = this.colorFilters.filter((v) => v != opt.color)
      this.setColorSelectedKeys()
    },
    onColorFilterCheckAll(e) {
      if (e.target.checked) this.colorFilters = this.colorFilterOptions.map(opt => opt.color)
      else this.colorFilters = []
      this.setColorSelectedKeys()
    },
    onFilterOnly(opt) {
      this.colorFilters = [opt.color]
      this.setColorSelectedKeys()
      this.delayConfirm()
    },
    setColorSelectedKeys() {
      this.setSelectedKeys(Array.from(new Set(
        this.filterOptions
          .filter(opt => this.colorFilters.includes(opt.color))
          .map(opt => opt.value)
      )))
    }
  },
  watch: {
    resetToken() {
      this.colorFilters = [] // this.colorFilterOptions.map(opt => opt.color)
    }
  }
}
</script>

<style lang="sass" scoped>

.filter-opt-list
  width: 100%
  overflow: auto

.color-filter-opt-color
  display: inline-block
  box-sizing: border-box
  width: 48px
  height: 18px
  color: transparent

.filter-opt-count
  color: #999
  font-size: 12px

.color-filter-opt
  position: relative
  width: 100%
  height: 22px

.filter-addon
  position: absolute
  visibility: hidden
  top: 0
  right: 4px
  line-height: 22px
  padding: 0 4px
  font-size: 0.88em
  background-color: white
  cursor: pointer
  color: #3b82f6

.color-filter-opt:hover .filter-addon
  visibility: visible

.btn-group
  display: flex
  align-items: center
  column-gap: 8px
</style>
