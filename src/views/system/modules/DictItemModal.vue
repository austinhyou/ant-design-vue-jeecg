<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="クローズ"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="名前">
          <a-input placeholder="名前を入力してください" v-decorator.trim="['itemText', validatorRules.itemText]"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="データ値">
          <a-input placeholder="データ値を入力してください" v-decorator.trim="['itemValue', validatorRules.itemValue]"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="説明">
          <a-input v-decorator="['description']"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="値を並べ替える">
          <a-input-number :min="1" v-decorator="['sortOrder',{'initialValue':1}]"/>
          値が小さいほど、フロントが高くなり、小数がサポートされます
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="有効にするかどうか"
          hasFeedback>
          <a-switch checkedChildren="有効にする" unCheckedChildren="無効にする" @change="onChose" v-model="visibleCheck"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import {addDictItem, editDictItem} from '@/api/api'

  export default {
    name: "DictItemModal",
    data() {
      return {
        title: "操作",
        visible: false,
        visibleCheck: true,
        model: {},
        dictId: "",
        status: 1,
        labelCol: {
          xs: {span: 24},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          itemText: {rules: [{required: true, message: '名前を入力してください!'}]},
          itemValue: {rules: [{required: true, message: 'データ値を入力してください!'}]},
        },
      }
    },
    created() {
    },
    methods: {
      add(dictId) {
        this.dictId = dictId;
        this.edit({});
      },
      edit(record) {
        if (record.id) {
          this.dictId = record.dictId;
          this.visibleCheck = (record.status == 1) ? true : false;
        }
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.model.dictId = this.dictId;
        this.model.status = this.status;
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'itemText', 'itemValue', 'description', 'sortOrder'))
        });
      },
      onChose(checked) {
        if (checked) {
          this.status = 1;
          this.visibleCheck = true;
        } else {
          this.status = 0;
          this.visibleCheck = false;
        }
      },
      // 確定
      handleOk() {
        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            values.itemText = (values.itemText || '').trim()
            values.itemValue = (values.itemValue || '').trim()
            values.description = (values.description || '').trim()
            let formData = Object.assign(this.model, values);
            formData.status = this.status;
            let obj;
            if (!this.model.id) {
              obj = addDictItem(formData);
            } else {
              obj = editDictItem(formData);
            }
            obj.then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.$emit('ok');
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
        })
      },
      // クローズ
      handleCancel() {
        this.close();
      },
      close() {
        this.$emit('close');
        this.visible = false;
      },
    }
  }
</script>