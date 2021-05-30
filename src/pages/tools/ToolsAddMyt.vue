<template lang="pug">
.add-fengniao
  .header
    span.title add-myt
  .form
    a-form(:model="formState" :label-col="{span: 2, offset: 4}" labelAlign="left" :wrapper-col="{span: 14}")

      a-form-item(label="shopId")
        a-input(v-model:value="formState.shopId" placeholder="请输入shopId")

      a-form-item(label="账号")
        a-auto-complete(v-model:value="formState.loginName" placeholder="请输入账号" @change="accountChange")
          template(#dataSource)
            a-select-option(v-for="login in mytLogins" :key="login") {{login}}

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
  name: 'tools-add-myt',
  data() {
    return {
      formState: {
        shopId: '',
        loginName: '',
        password: ''
      },
      loading: false,
      loading_del: false,
      res: '',
      myts: []
    }
  },
  computed: {
    mytLogins() {
      return Array.from(new Set(this.myts.map(v => v.login_name)))
    }
  },
  methods: {
    fetchMyt() {
      this.loading = false
      new Shop()
        .myt()
        .then(res => {
          this.myts = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    accountChange(value) {
      let f = this.myts.find(v => v.login_name == value)
      if (f) {
        this.formState.shopId = f.shop_id
        this.formState.password = f.pw
      } else {
        this.formState.shopId = ''
        this.formState.password = ''
      }
    },
    onSubmit() {
      Object.keys(this.formState)
        .filter(k => this.formState[k] != null)
        .map(k => this.formState[k] = this.formState[k].trim())
      console.log(this.formState)
      this.loading = true
      new Shop()
        .addMyt(this.formState)
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
        .delMyt(this.formState)
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
    this.fetchMyt()
  }
}
</script>

<style lang="sass" scoped>
.add-fengniao
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
