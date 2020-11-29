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
          label="職務番号">
          <a-input placeholder="職務番号を入力してください" v-decorator="['code', validatorRules.code]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="職務名">
          <a-input placeholder="職務名を入力してください" v-decorator="['name', validatorRules.name]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ランク"
        >
          <j-dict-select-tag
            placeholder="ランクを選択してください"
            :triggerChange="true"
            dictCode="position_rank"
            v-decorator="['postRank', validatorRules.postRank]"
          />
        </a-form-item>
        <!--<a-form-item-->
        <!--  :labelCol="labelCol"-->
        <!--  :wrapperCol="wrapperCol"-->
        <!--  label="会社ID">-->
        <!--  <a-input placeholder="会社IDを入力してください" v-decorator="['companyId', {}]"/>-->
        <!--</a-form-item>-->

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction } from '@/api/manage'
  import { duplicateCheck } from '@/api/api'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'

  let validatorCodeTimer = null

  export default {
    name: 'SysPositionModal',
    components: { JDictSelectTag },
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          code: {
            rules: [
              { required: true, message: '職務番号を入力してください' },
              {
                validator: (rule, value, callback) => {
                  // 一定期間内に複数のリクエストが送信されないようにする関数デバウンスの簡単な実装
                  if (validatorCodeTimer) {
                    // 前回開始したタイマーを停止します
                    clearTimeout(validatorCodeTimer)
                  }
                  validatorCodeTimer = setTimeout(() => {
                    duplicateCheck({
                      tableName: 'sys_position',
                      fieldName: 'code',
                      fieldVal: value,
                      dataId: this.model.id
                    }).then((res) => {
                      if (res.success) {
                        callback()
                      } else {
                        callback(res.message)
                      }
                    }).catch(console.error)
                  }, 300)
                }
              }
            ]
          },
          name: { rules: [{ required: true, message: '職務名を入力してください' }] },
          postRank: { rules: [{ required: true, message: 'ランクを選択してください' }] },
        },
        url: {
          add: '/sys/position/add',
          edit: '/sys/position/edit',
        },
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
          this.form.setFieldsValue(pick(this.model,
            'code',
            'name',
            'postRank',
            // 'companyId'
          ))
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
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }

            let formData = Object.assign(this.model, values)
            httpAction(httpurl, formData, method).then((res) => {
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
      },


    }
  }
</script>

<style lang="less" scoped>

</style>