<template lang="pug">
a-form(ref="form" :model="form" :rules="rules" :label-col="{span: 1}" :wrapper-col="{span: 14}")
  a-form-item(label="name")
    a-auto-complete.plan-input(v-model:value="form.name" :options="persons")
      a-input(size="small")
  a-form-item(label="方案")
    a-textarea.plan-input(v-model:value="form.plan" :autoSize="{minRows: 3}" showCount)
  a-form-item(:wrapper-col="{span: 10, offset: 1}")
    a-button(type="primary" @click="onSubmit" :loading="submitting") submit                    
</template>

<script>
import { message } from 'ant-design-vue'
import { postPlan } from '../api'

export default {
  name: 'hello-form',
  props: {
    id: Number,
    shopId: Number,
    persons: Array,
    problem: String
  },
  data() {
    return {
      form: {
        name: '',
        plan: ''
      },
      rules: {
        name: [
          { type: 'string', required: true, message: 'name is required', trigger: 'blur' },
          {
            type: 'string',
            min: 1,
            max: 10,
            message: 'name length must >= 1 and <= 10',
            trigger: 'blur'
          }
        ],
        plan: [
          { type: 'string', required: true, message: 'plan is required', trigger: 'blur' },
          { type: 'string', min: 1, message: 'plan length must >= 1', trigger: 'blur' }
        ]
      },
      submitting: false
    }
  },
  methods: {
    onSubmit() {
      this.submitting = true
      this.$refs.form
        .validate()
        .then(() => {
          if (this.form.name.length < 2 || this.form.plan.length < 1) return
          postPlan(this.id, this.form.name, this.problem, this.form.plan).then(async res => {
            if (res.err) {
              message.error(`submit error ${res.err}`)
            } else {
              message.success(`submit success ${res.data}`)
              this.$emit('submitPlan', { id: this.id, op_id: res.data, shop_id: this.shopId, op_name: this.form.name, q: this.problem, a: this.form.plan })
            }
            this.submitting = false
          })
        })
        .catch(err => console.error(err))
    }
  }
}
</script>
