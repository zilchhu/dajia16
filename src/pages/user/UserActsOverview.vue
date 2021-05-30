<template lang="pug">
svg(width="100%" :height="r_calends.length * 150")
  g(v-for="(item, i) in r_calends" :key="item.key" fill="black" :transform="`translate(0, ${i*item.grid_height+20})`")
    text(font-size="14") {{item.key}}
    g(v-for="(row, j) in item.calends" :key="row.join(',')")
      g(v-for="(col, k) in row" :key="col" fill="#f0fff4")
        a(v-if="col != 0" :href="`/user/${username}/${time2date(item.key, col)}`")
          rect(:x="k * (cell_width + cell_gap)" :y="j * (cell_width + cell_gap) + 8" :width="cell_width" :height="cell_width" :fill="fill_color(item.key, col)")
            title /{{col}} ({{ find_value(item.key, col)?.length || 0 }})
</template>

<script>
import User from '../../api/user'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import flatten from 'flatten'
import calendar from 'calendar'
const cal = new calendar.Calendar(1)

export default {
  name: 'user-acts-overview',
  props: {
    username: String
  },
  data() {
    return {
      activities_all: {
        activities: [],
        counts: {
          activities: {
            count_a: 0,
            count_shop: 0
          }
        }
      },
      loading: false,
      cell_width: 16,
      cell_gap: 6
    }
  },
  computed: {
    times() {
      return Object.keys(this.activities_all.activities)
    },
    years() {
      return Array.from(new Set(this.times.map(t => dayjs(t).year())))
    },
    months() {
      return this.years.map(y => ({
        year: y,
        months: Array.from(new Set(this.times.filter(t => dayjs(t).year() == y).map(t => dayjs(t).month())))
      }))
    },
    calends() {
      let temp = this.months.map(y =>
        y.months.map(m => ({
          year: y.year,
          month: m,
          calends: cal.monthDays(y.year, m)
        }))
      )
      return flatten(temp)
    },
    r_calends() {
      return this.calends.map(c => ({
        ...c,
        key: `${c.year}/${c.month + 1}`,
        grid_height: c.calends.length * this.cell_width + (c.calends.length - 1) * this.cell_gap + 80
      }))
    }
  },
  methods: {
    fetch_user_all_acts() {
      this.loading = true
      new User(this.username)
        .all_acts()
        .then(res => {
          this.activities_all = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    pad(n, width, z) {
      z = z || '0'
      n = n + ''
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    },
    find_value(ym, d) {
      return this.activities_all.activities[dayjs(`${ym}/${d}`, 'YYYY/M/D').format('YYYY-MM-DD')]
    },
    fill_color(ym, d) {
      let greens = [
        '#f0fff4',
        '#dcffe4',
        '#bef5cb',
        '#85e89d',
        '#34d058',
        '#28a745',
        '#22863a',
        '#176f2c',
        '#165c26',
        '#144620'
      ]
      let lengths = Object.values(this.activities_all.activities).map(v => v.length)
      let max = Math.max(...lengths)
      let min = Math.min(...lengths)
      let idx = Math.floor((9 / (max - min)) * (this.find_value(ym, d)?.length ?? 0))

      return greens[idx]
    },
    time2date(ym, d) {
      return dayjs()
        .startOf('day')
        .diff(dayjs(`${ym}/${d}`, 'YYYY/M/D').startOf('day'), 'day')
    }
  },
  created() {
    this.fetch_user_all_acts()
  }
}
</script>
