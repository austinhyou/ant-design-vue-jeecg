<template>
  <a-card :visible="visible">
    <a-form :form="form">
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="機関名">
        <a-input style="border:0px;" placeholder="" v-decorator="['departName', {}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="上位部門">
        <a-tree-select
          disabled
          style="width:100%;border: 0px;border: none;outline:none;"
          :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
          :treeData="treeData"
          v-model="model.parentId"
          placeholder="なし">
        </a-tree-select>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="機関コード">
        <a-input style="border:0px;" placeholder="" v-decorator="['orgCode', {}]"/>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="機関タイプ">
          <a-radio-group :disabled="true" v-decorator="['orgCategory',{}]" placeholder="機関タイプを選択してください">
            <a-radio value="1">
              会社
            </a-radio>
            <a-radio value="2">
              部門
            </a-radio>
            <a-radio value="3">
              役職
            </a-radio>
          </a-radio-group>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="ソート">
        <a-input-number style="border:0px;" v-decorator="[ 'departOrder',{}]"/>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="電話番号">
        <a-input style="border:0px;" placeholder="" v-decorator="['mobile', {}]"/>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="アドレス">
        <a-input style="border:0px;" placeholder="" v-decorator="['address', {}]"/>
      </a-form-item>
      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="備考">
        <a-textarea style="border:0px;" placeholder="" v-decorator="['memo', {}]"/>
      </a-form-item>
    </a-form>
  </a-card>
</template>
<script>
  import pick from 'lodash.pick'
  import {queryIdTree} from '@/api/api'

  export default {
    name: 'DeptBaseInfo',
    components: {},
    data() {
      return {
        departTree: [],
        id: '',
        model: {},
        visible: false,
        disable: true,
        treeData: [],
        form: this.$form.createForm(this),
        labelCol: {
          xs: {span: 24},
          sm: {span: 3}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
      }
    },
    created() {
      this.loadTreeData();
    },
    methods: {
      loadTreeData() {
        queryIdTree().then((res) => {
          if (res.success) {
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i];
              this.treeData.push(temp);
            }
          }

        })
      },
      open(record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        console.log("record:");
        console.log(record);
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(record, 'orgCategory','departName', 'parentId', 'orgCode', 'departOrder', 'mobile', 'fax', 'address', 'memo'));
        });
      },
      clearForm() {
        this.form.resetFields();
        this.treeData = [];
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>