<template>
  <a-modal
    :title="title"
    :width="800"
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
          label="データソースコード">
          <a-input placeholder="データソースコードを入力してください" :disabled="!!model.id" v-decorator="['code', validatorRules.code]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="データソース名">
          <a-input placeholder="データソース名を入力してください" v-decorator="['name', validatorRules.name]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="データベースタイプ">
          <j-dict-select-tag placeholder="データベースタイプを選択してください" dict-code="database_type" triggerChange v-decorator="['dbType', validatorRules.dbType]" @change="handleDbTypeChange"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ドライブクラス">
          <a-input placeholder="ドライバーを入力してください" v-decorator="['dbDriver', validatorRules.dbDriver]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="データソースアドレス">
          <a-input placeholder="データソースアドレスを入力してください" v-decorator="['dbUrl', validatorRules.dbUrl]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="データベース名">
          <a-input placeholder="データベース名を入力してください" v-decorator="['dbName', validatorRules.dbName]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ユーザー名">
          <a-input placeholder="ユーザー名を入力してください" v-decorator="['dbUsername', validatorRules.dbUsername]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="パスワード">
          <a-row :gutter="8">
            <a-col :span="21">
              <a-input-password placeholder="パスワードを入力してください" v-decorator="['dbPassword', validatorRules.dbPassword]"/>
            </a-col>
            <a-col :span="3">
              <a-button type="primary" size="small" style="width: 100%" @click="handleTest">テスト</a-button>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="備考">
          <a-textarea placeholder="備考を入力してください" v-decorator="['remark', {}]"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction, postAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'SysDataSourceModal',
    components: {},
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
            validateFirst: true,
            rules: [
              { required: true, message: 'データソースコードを入力してください!' },
              {
                validator: (rule, value, callback) => {
                  let pattern = /^[a-z|A-Z][a-z|A-Z\d_-]{0,}$/
                  if (!pattern.test(value)) {
                    callback('コードは文字で始まる必要があり、数字、下線、水平バーを含めることができます')
                  } else {
                    validateDuplicateValue('sys_data_source', 'code', value, this.model.id, callback)
                  }
                }
              }
            ]
          },
          name: { rules: [{ required: true, message: 'データソース名を入力してください!' }] },
          dbType: { rules: [{ required: true, message: 'データベースタイプを選択してください!' }] },
          dbDriver: { rules: [{ required: true, message: 'ドライバーを入力してください!' }] },
          dbUrl: { rules: [{ required: true, message: 'データソースアドレスを入力してください!' }] },
          dbName: { rules: [{ required: true, message: 'データベース名を入力してください!' }] },
          dbUsername: { rules: [{ required: true, message: 'ユーザー名を入力してください!' }] },
          dbPassword: { rules: [{ required: true, message: 'パスワードを入力してください!' }] }
        },
        url: {
          add: '/sys/dataSource/add',
          edit: '/sys/dataSource/edit',
        },
        dbDriverMap: {
          // MySQL データベース
          '1': { dbDriver: 'com.mysql.jdbc.Driver' },
          // Oracle
          '2': { dbDriver: 'oracle.jdbc.OracleDriver' },
          // SQLServer データベース
          '3': { dbDriver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver' },
        },
        dbUrlMap: {
          // MySQL データベース
          '1': { dbUrl: 'jdbc:mysql://127.0.0.1:3306/jeecg-boot?characterEncoding=UTF-8&useUnicode=true&useSSL=false' },
          // Oracle
          '2': { dbUrl: 'jdbc:oracle:thin:@127.0.0.1:1521:ORCL' },
          // SQLServer データベース
          '3': { dbUrl: 'jdbc:sqlserver://127.0.0.1:1433;SelectMethod=cursor;DatabaseName=jeecgboot' }
        }
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
          this.form.setFieldsValue(pick(this.model, 'code', 'name', 'remark', 'dbType', 'dbDriver', 'dbUrl', 'dbName', 'dbUsername', 'dbPassword'))
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true
            let formData = Object.assign(this.model, values)
            let httpUrl = this.url.add, method = 'post'
            if (this.model.id) {
              httpUrl = this.url.edit
              method = 'put'
              // コードの特殊性により、変更することはできません
              formData['code'] = undefined
            }
            httpAction(httpUrl, formData, method).then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('ok')
                this.close()
              } else {
                this.$message.warning(res.message)
              }
            }).finally(() => {
              this.confirmLoading = false
            })
          }
        })
      },
      handleCancel() {
        this.close()
      },
      // データソース構成が正常に接続できるかどうかをテストします
      handleTest() {
        let keys = ['dbType', 'dbDriver', 'dbUrl', 'dbName', 'dbUsername', 'dbPassword']
        // 上記のフィールドの値を取得し、検証ステータスをクリアします
        let fieldsValues = this.form.getFieldsValue(keys)
        let setFields = {}
        keys.forEach(key => setFields[key] = { value: fieldsValues[key], errors: null })
        // 確認ステータスをクリアします。目的はエラーテキストを点滅させることです
        this.form.setFields(setFields)
        // 検証を繰り返す
        this.$nextTick(() => {
          this.form.validateFields(keys, (errors, values) => {
            if (!errors) {
              let loading = this.$message.loading('接続中……', 0)
              postAction('/online/cgreport/api/testConnection', fieldsValues).then(res => {
                if (res.success) {
                  this.$message.success('接続に成功しました')
                } else throw new Error(res.message)
              }).catch(error => {
                this.$warning({ title: '接続に失敗しました', content: error.message || error })
              }).finally(() => loading())
            }
          })
        })
      },
      // データベースタイプが変更されると、リンケージによってデータベースドライバが変更されます
      handleDbTypeChange(val) {
        let dbDriver = this.dbDriverMap[val]
        let dbUrl = this.dbUrlMap[val]
        if (dbDriver) {
          this.form.setFieldsValue(dbDriver)
        }
        if (dbUrl) {
          this.form.setFieldsValue(dbUrl)
        }
      },
    }
  }
</script>

<style lang="less" scoped></style>