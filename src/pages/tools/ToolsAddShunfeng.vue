<template lang="pug">
.add-shunfeng
  .header
    span.title add-shunfeng
  .form
    a-form(:model="formState" :label-col="{span: 2, offset: 4}" labelAlign="left" :wrapper-col="{span: 14}")

      a-form-item(label="shopId")
        a-input(v-model:value="formState.shopId" placeholder="请输入shopId")

      a-form-item(label="门店名")
        a-input(v-model:value="formState.shopName" placeholder="请输入门店名")

      a-form-item(label="账号")
        a-auto-complete(v-model:value="formState.username" placeholder="请输入账号" @change="accountChange")
          template(#dataSource)
            a-select-option(v-for="login in shunfengLogins" :key="login") {{login}}

      a-form-item(label="密码")
        a-input(v-model:value="formState.password" placeholder="请输入密码")
      
      a-form-item(:wrapper-col="{ span: 14, offset: 6 }")
        a-button(type="primary" :loading="loading" @click="onSubmit") 保存
        a-button(:loading="loading_del" @click="onDel" style='margin-left: 10px;') 删除
       
    p {{res}}

</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'

export default {
  name: 'tools-add-shunfeng',
  data() {
    return {
      formState: {
        shopId: '',
        shopName: '',
        username: '',
        password: ''
      },
      loading: false,
      loading_del: false,
      res: '',
      shunfengs: []
    }
  },
  computed: {
    shunfengLogins() {
      return Array.from(new Set(this.shunfengs.map(v => v.user_name)))
    }
  },
  methods: {
    fetchShunfeng() {
      this.loading = false
      new Shop()
        .shunfeng()
        .then(res => {
          this.shunfengs = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    accountChange(value) {
      let f = this.shunfengs.find(v => v.user_name == value)
      if (f) {
        this.formState.shopId = f.shop_id
        this.formState.shopName = f.shop_name
        this.formState.password = f.user_pass
      } else {
        this.formState.shopId = ''
        this.formState.shopName = ''
        this.formState.password = ''
      }
    },
    onSubmit() {
      Object.keys(this.formState)
        .filter(k => this.formState[k] != null)
        .map(k =>
          typeof this.formState[k] == 'string' ? (this.formState[k] = this.formState[k].trim()) : this.formState[k]
        )
      console.log({ ...this.formState }) 
      this.loading = true
      new Shop()
        .addShunfeng({ ...this.formState })
        .then(res => {
          this.res = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    onDel() {
      console.log(this.formState)
      this.loading_del = true
      new Shop()
        .delShunfeng(this.formState)
        .then(res => {
          this.res = res
          this.loading_del = false
        })
        .catch(err => {
          message.error(err)
          this.loading_del = false
        })
    }
  },
  created() {
    this.fetchShunfeng()
  }
}
</script>

<style lang="sass" scoped>
.add-shunfeng
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
</style>
