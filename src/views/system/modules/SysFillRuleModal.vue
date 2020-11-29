<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="クローズ">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ルール名">
          <a-input placeholder="ルール名を入力してください" v-decorator="['ruleName', validatorRules.ruleName]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ルールコード">
          <a-input placeholder="ルールコードを入力してください" :disabled="disabledCode" v-decorator="['ruleCode', validatorRules.ruleCode]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ルール実装クラス">
          <a-input placeholder="ルール実装クラスを入力してください" v-decorator="['ruleClass', validatorRules.ruleClass]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ルールパラメータ">
          <a-textarea placeholder="ルールパラメータを入力してください" :rows="5" v-decorator="['ruleParams', validatorRules.ruleParams]"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'SysFillRuleModal',
    components: {},
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          ruleName: { rules: [{ required: true, message: 'ルール名を空にすることはできません' }] },
          ruleCode: {
            rules: [
              { required: true, message: 'ルールコードを空にすることはできません' },
              { validator: (rule, value, callback) => validateDuplicateValue('sys_fill_rule', 'rule_code', value, this.model.id, callback) }
            ]
          },
          ruleClass: { rules: [{ required: true, message: 'ルール実装クラスを空にすることはできません' }] },
          ruleParams: {
            rules: [{
              validator: (rule, value, callback) => {

                try {
                  let json = JSON.parse(value)
                  if (json instanceof Array) {
                    callback('JSON配列ではなく、JSON対象のみを渡すことができます')
                  } else if (json instanceof Object) {
                    callback()
                  } else {
                    callback('JSON文字列を入力してください')
                  }
                } catch {
                  callback('JSON文字列を入力してください')
                }
              }
            }]
          },
        },
        url: {
          add: '/sys/fillRule/add',
          edit: '/sys/fillRule/edit',
        },
      }
    },
    computed: {
      disabledCode() {
        return !!this.model.id
      }
    },
    created() {
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'ruleName', 'ruleCode', 'ruleClass', 'ruleParams'))
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        const that = this
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpUrl = this.url.add, method = 'post'
            if (this.model.id) {
              httpUrl = this.url.edit
              method = 'put'
            }

            let formData = Object.assign(this.model, values)
            httpAction(httpUrl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })
          }
        })
      },
      handleCancel() {
        this.close()
      }

    }
  }
</script>

<style lang="less" scoped>

</style>