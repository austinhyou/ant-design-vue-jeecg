<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form :form="form" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-item label="顧客ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusId']" placeholder="请输入顧客ID"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="顧客名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusName']" placeholder="请输入顧客名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="会社住所" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusAddress']" placeholder="请输入会社住所"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="連絡先" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusPername']" placeholder="请输入連絡先"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="電話番号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusPhonenum']" placeholder="请输入電話番号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="項目分類" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['cusSort']" :trigger-change="true" dictCode="" placeholder="请选择項目分類"/>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="顧客級別" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusSen']" placeholder="请输入顧客級別"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="顧客タイプ" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusType']" placeholder="请输入顧客タイプ"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="項目内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusHeadline']" placeholder="请输入項目内容"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="備考" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusMemos']" placeholder="请输入備考"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="操作記録" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['cusNote']" placeholder="请输入操作記録"></a-input>
            </a-form-item>
          </a-col>
          <a-col v-if="showFlowSubmitButton" :span="24" style="text-align: center">
            <a-button @click="submitForm">提 交</a-button>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import JFormContainer from '@/components/jeecg/JFormContainer'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"

  export default {
    name: 'CusCustomerForm',
    components: {
      JFormContainer,
      JDictSelectTag,
    },
    props: {
      //流程表单data
      formData: {
        type: Object,
        default: ()=>{},
        required: false
      },
      //表单模式：true流程表单 false普通表单
      formBpm: {
        type: Boolean,
        default: false,
        required: false
      },
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        form: this.$form.createForm(this),
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
        validatorRules: {
        },
        url: {
          add: "/cus/cusCustomer/add",
          edit: "/cus/cusCustomer/edit",
          queryById: "/cus/cusCustomer/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return false
          }
          return true
        }
        return this.disabled
      },
      showFlowSubmitButton(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return true
          }
        }
        return false
      }
    },
    created () {
      //如果是流程中表单，则需要加载流程表单data
      this.showFlowData();
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'cusId','cusName','cusAddress','cusPername','cusPhonenum','cusSort','cusSen','cusType','cusHeadline','cusMemos','cusNote'))
        })
      },
      //渲染流程表单数据
      showFlowData(){
        if(this.formBpm === true){
          let params = {id:this.formData.dataId};
          getAction(this.url.queryById,params).then((res)=>{
            if(res.success){
              this.edit (res.result);
            }
          });
        }
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'cusId','cusName','cusAddress','cusPername','cusPhonenum','cusSort','cusSen','cusType','cusHeadline','cusMemos','cusNote'))
      },
    }
  }
</script>