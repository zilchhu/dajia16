<template lang="pug">
.tests
  .header
    span.title tests:sync/del
  .form
    a-select(v-model:value="wmpoi" showSearch :filterOption="filterShop" placeholder="请选择门店" size="small" style="width: 160px; flex: 1 1 auto;")
      a-select-option(v-for="shop in mtShops" :key="shop.id" :value="`${shop.id}||${shop.poiName}`") {{shop.id}} {{shop.poiName}} 
    //- a-input(v-model:value="wmPoiId" placeholder="wmPoiId" size="small" style="width: 160px; flex: 1 1 auto;")
    a-button(@click="sync" :loading="loading_sync" size="small" :disabled="false") 同步
    a-button(@click="del" :loading="loading_del" size="small") 删除
  .txt {{res_sync}}
  .txt {{res_del}}
</template>

<script>
import { notification, message } from 'ant-design-vue'
import Tests from '../../api/tests'
import Shop from '../../api/shop'
import SockJS from 'sockjs-client'

export default {
  name: 'tools-tests',
  data() {
    return {
      wmpoi: '',
      wmPoiId: '',
      res_sync: '',
      res_del: '',
      mtShops: [],
      loading: false,
      loading_sync: false,
      loading_del: false,
      sock: new SockJS('http://192.168.3.3:9999/tests_sync')
    }
  },
  methods: {
    fetchMtShops() {
      this.loading = true
      new Shop()
        .shops('mt')
        .then(res => {
          this.mtShops = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    filterShop(input, option) {
      return option.props.value.includes(input.trim())
    },
    sync() {
      if(this.wmpoi.length == 0) return
      this.wmPoiId = this.wmpoi.split('||')[0]
      this.loading_sync = true
      this.sock.send(this.wmPoiId)
      this.sock.onmessage = e => {
        console.log('message', e.data)
        this.res_sync = e.data
        notification.open({
          message: `${this.wmPoiId}`,
          description: e.data,
          duration: 0
        })
        this.loading_sync = false
      }
    },
    del() {
      if(this.wmpoi.length == 0) return
      this.wmPoiId = this.wmpoi.split('||')[0]
      this.loading_del = true
      new Tests(this.wmPoiId)
        .del()
        .then(res => {
          this.res_del = res
          this.loading_del = false
        })
        .catch(err => {
          this.res_del = err
          this.loading_del = false
        })
    }
  },
  created() {
    this.fetchMtShops()
    this.sock.onopen = function() {
      console.log('open')
    }

    this.sock.onclose = function() {
      console.log('close')
    }
  }
}
</script>

<style lang="sass" scoped>
.tests
  width: 100%
  padding: 0 20px

.header
  display: flex
  width: 100%
  justify-content: flex-start
  height: 60px

.title
  font-size: 1.1em
  font-weight: bold

.form
  display: flex
  height: 60px
  justify-content: space-around
  align-items: center

.form > *
  margin-right: 30px

.txt
  margin-top: 20px
</style>
