<template>
  <a-modal
    :title="title"
    :width="1000"
    :visible="visible"
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
          <a-input placeholder="ルールコードを入力してください" v-decorator="['ruleCode', validatorRules.ruleCode]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ルールの説明">
          <a-textarea placeholder="ルールの説明を入力してください" v-decorator="['ruleDescription', {}]"/>
        </a-form-item>

      </a-form>
      <!-- ルールの設計 -->
      <a-tabs v-model="tabs.activeKey">
        <a-tab-pane tab="ローカルルール" :key="tabs.design.key" forceRender>
          <a-alert type="info" showIcon message="入力した桁数に応じて、ローカルルールが順番にチェックされます。"/>
          <j-editable-table
            ref="designTable"
            dragSort
            rowNumber
            :maxHeight="240"
            :columns="tabs.design.columns"
            :dataSource="tabs.design.dataSource"
            style="margin-top: 8px;"
          >

            <template #action="props">
              <my-action-button :rowEvent="props"/>
            </template>

          </j-editable-table>
        </a-tab-pane>
        <a-tab-pane tab="グローバルルール" :key="tabs.global.key" forceRender>
          <j-editable-table
            ref="globalTable"
            dragSort
            rowNumber
            actionButton
            :maxHeight="240"
            :columns="tabs.global.columns"
            :dataSource="tabs.global.dataSource"
          >

            <template #actionButtonAfter>
              <a-alert type="info" showIcon message="グローバルルールは、ユーザーが入力したすべての文字を検証できます。グローバルルールの優先度はローカルルールの優先度よりも高くなります。" style="margin-bottom: 8px;"/>
            </template>

            <template #action="props">
              <my-action-button :rowEvent="props" allowEmpty/>
            </template>

          </j-editable-table>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction } from '@/api/manage'
  import { validateDuplicateValue, alwaysResolve, failedSymbol } from '@/utils/util'
  import { FormTypes } from '@/utils/JEditableTableUtil'
  import JEditableTable from '@comp/jeecg/JEditableTable'

  export default {
    name: 'SysCheckRuleModal',
    components: {
      JEditableTable,
      'my-action-button': {
        props: { rowEvent: Object, allowEmpty: Boolean },
        methods: {
          confirmIsShow() {
            const { index, allValues: { inputValues } } = this.rowEvent
            let value = inputValues[index]
            return value.digits || value.pattern
          },
          handleLineAdd() {
            const { target } = this.rowEvent
            target.add()
          },
          handleLineDelete() {
            const { rowId, target } = this.rowEvent
            target.removeRows(rowId)
          },
          renderDeleteButton() {
            if (this.allowEmpty || this.rowEvent.index > 0) {
              if (this.confirmIsShow()) {
                return (
                  <a-popconfirm title="削除を確認しますか？" onConfirm={this.handleLineDelete}>
                    <a-button icon="minus"/>
                  </a-popconfirm>
                )
              } else {
                return (
                  <a-button icon="minus" onClick={this.handleLineDelete}/>
                )
              }
            }
            return ''
          },
        },
        render() {
          return (
            <div>
              <a-button onClick={this.handleLineAdd} icon="plus"/>
              &nbsp;
              {this.renderDeleteButton()}
            </div>
          )
        }
      }
    },
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
          ruleName: { rules: [{ required: true, message: 'ルール名を入力してください!' },] },
          ruleCode: {
            rules: [
              { required: true, message: 'ルールコードを入力してください!' },
              { validator: (rule, value, callback) => validateDuplicateValue('sys_check_rule', 'rule_code', value, this.model.id, callback) }
            ]
          },
        },
        tabs: {
          activeKey: 'design',
          global: {
            key: 'global',
            columns: [
              {
                title: '優先度',
                key: 'priority',
                width: '15%',
                type: FormTypes.select,
                defaultValue: '1',
                options: [
                  { title: '優先実行', value: '1' },
                  { title: '最後実行', value: '0' },
                ],
                validateRules: []
              },
              {
                title: 'ルール（正規表現）',
                key: 'pattern',
                width: '50%',
                type: FormTypes.input,
                validateRules: [
                  { required: true, message: 'ルールを空にすることはできません' },
                  { handler: this.validatePatternHandler },
                ]
              },
              {
                title: 'プロンプトテキスト',
                key: 'message',
                width: '20%',
                type: FormTypes.input,
                validateRules: [
                  { required: true, message: '$ {title}を空にすることはできません' },
                ]
              },
              {
                title: '操作',
                key: 'action',
                width: '15%',
                slotName: 'action',
                type: FormTypes.slot
              }
            ],
            dataSource: [],
          },
          design: {
            key: 'design',
            columns: [
              {
                title: '桁',
                key: 'digits',
                width: '15%',
                type: FormTypes.inputNumber,
                validateRules: [
                  { required: true, message: '$ {title}を空にすることはできません' },
                  { pattern: /^[1-9]\d*$/, message: 'ゼロより大きい正の整数を入力してください' },
                ]
              },
              {
                title: 'ルール（正規表現）',
                key: 'pattern',
                width: '50%',
                type: FormTypes.input,
                validateRules: [
                  { required: true, message: 'ルールを空にすることはできません' },
                  { handler: this.validatePatternHandler }
                ]
              },
              {
                title: 'プロンプトテキスト',
                key: 'message',
                width: '20%',
                type: FormTypes.input,
                validateRules: [
                  { required: true, message: '$ {title}を空にすることはできません' },
                ]
              },
              {
                title: '操作',
                key: 'action',
                width: '15%',
                slotName: 'action',
                type: FormTypes.slot
              },
            ],
            dataSource: [],
          }
        },
        url: {
          add: '/sys/checkRule/add',
          edit: '/sys/checkRule/edit',
        },
      }
    },
    created() {
    },
    methods: {

      validatePatternHandler(type, value, row, column, callback, target) {
        if (type === 'blur' || type === 'getValues') {
          try {
            new RegExp(value)
            callback(true)
          } catch (e) {
            callback(false, '正しい正規表現を入力してください')
          }
        } else {
          callback(true) // 記入しない、またはnullを記入することは、操作がないことを意味します
        }
      },

      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.tabs.activeKey = this.tabs.design.key
        this.tabs.global.dataSource = []
        this.tabs.design.dataSource = [{ digits: '', pattern: '', message: '' }]
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'ruleName', 'ruleCode', 'ruleDescription'))
          // サブテーブルデータ
          let ruleJson = this.model.ruleJson
          if (ruleJson) {
            let ruleList = JSON.parse(ruleJson)
            // グローバルルールとローカルルールを除外する
            let global = [], design = [], priority = '1'
            ruleList.forEach(rule => {
              if (rule.digits === '*') {
                global.push(Object.assign(rule, { priority }))
              } else {
                priority = '0'
                design.push(rule)
              }
            })
            this.tabs.global.dataSource = global
            this.tabs.design.dataSource = design
          }
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        Promise.all([
          // メインフォームの検証
          alwaysResolve(new Promise((resolve, reject) => {
            this.form.validateFields((error, values) => error ? reject(error) : resolve(values))
          })),
          // ローカルルールサブテーブルの検証
          alwaysResolve(this.$refs.designTable.getValuesPromise),
          // グローバルルールサブテーブルの検証
          alwaysResolve(this.$refs.globalTable.getValuesPromise),
        ]).then(results => {
          let [mainResult, designResult, globalResult] = results

          if (mainResult.type === failedSymbol) {
            return Promise.reject('マスターテーブルの検証に失敗しました')
          } else if (designResult.type === failedSymbol) {
            this.tabs.activeKey = this.tabs.design.key
            return Promise.reject('ローカルルールサブテーブルの検証に失敗しました')
          } else if (globalResult.type === failedSymbol) {
            this.tabs.activeKey = this.tabs.global.key
            return Promise.reject('グローバルルールサブテーブルの検証に失敗しました')
          } else {
            // すべての検証に合格しました。このステップはデータを統合することです
            let mainValues = mainResult.data, globalValues = globalResult.data, designValues = designResult.data

            // 2つのサブテーブルからのデータを統合する
            let firstGlobal = [], afterGlobal = []
            globalValues.forEach(v => {
              v.digits = '*'
              if (v.priority === '1') {
                firstGlobal.push(v)
              } else {
                afterGlobal.push(v)
              }
            })
            let concatValues = firstGlobal.concat(designValues).concat(afterGlobal)
            let subValues = concatValues.map(i => pick(i, 'digits', 'pattern', 'message'))

            // バックエンドに渡すために使用されるformDataを生成します
            let ruleJson = JSON.stringify(subValues)
            let formData = Object.assign(this.model, mainValues, { ruleJson })

            // リクエスト方法とリクエストアドレスを決定し、リクエストを送信します
            let method = 'post', httpUrl = this.url.add
            if (this.model.id) {
              method = 'put'
              httpUrl = this.url.edit
            }
            this.confirmLoading = true
            return httpAction(httpUrl, formData, method)
          }
        }).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.message)
          }
        }).catch(e => {
          console.error(e)
        }).finally(() => {
          this.confirmLoading = false
        })
      },
      handleCancel() {
        this.close()
      },

    }
  }
</script>

<style lang="less" scoped></style>