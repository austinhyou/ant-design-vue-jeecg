<template>
  <a-modal
    :title="title"
    :width="800"
    :ok=false
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: {disabled: disableSubmit} }"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="クローズ">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="機関名"
          :hidden="false"
          hasFeedback >
          <a-input id="departName" placeholder="機関名/部門名を入力してください" v-decorator="['departName', validatorRules.departName ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :hidden="seen" label="上位部門" hasFeedback>
        <a-tree-select
          style="width:100%"
          :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
          :treeData="departTree"
          v-model="model.parentId"
          placeholder="上位部門を選択してください"
          :disabled="condition">
        </a-tree-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="機関タイプ">
          <template v-if="seen">
          <a-radio-group v-decorator="['orgCategory',validatorRules.orgCategory]" placeholder="機関タイプを選択してください">
            <a-radio value="1">
              会社
            </a-radio>
          </a-radio-group>
          </template>
          <template v-else>
            <a-radio-group v-decorator="['orgCategory',validatorRules.orgCategory]" placeholder="機関タイプを選択してください">
              <a-radio value="2">
                部門
              </a-radio>
              <a-radio value="3">
                役職
              </a-radio>
            </a-radio-group>
          </template>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="電話番号">
          <a-input placeholder="電話番号を入力してください" v-decorator="['mobile',validatorRules.mobile]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ファックス">
          <a-input placeholder="ファックスを入力してください" v-decorator="['fax', {}]"  />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="アドレス">
          <a-input placeholder="アドレスを入力してください" v-decorator="['address', {}]"  />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ソート">
          <a-input-number v-decorator="[ 'departOrder',{'initialValue':0}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="備考">
          <a-textarea placeholder="備考を入力してください" v-decorator="['memo', {}]"  />
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import { queryIdTree } from '@/api/api'
  import pick from 'lodash.pick'
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  export default {
    name: "SysDepartModal",
    components: { ATextarea },
    data () {
      return {
        departTree:[],
        orgTypeData:[],
        phoneWarning:'',
        departName:"",
        title:"操作",
        seen:false,
        visible: false,
        condition:true,
        disableSubmit:false,
        model: {},
        menuhidden:false,
        menuusing:true,
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
        validatorRules:{
        departName:{rules: [{ required: true, message: '機関名/部門名を入力してください!' }]},
        orgCode:{rules: [{ required: true, message: '機関コードを入力してください！' }]},
         mobile:{rules: [{validator:this.validateMobile}]}
        },
        url: {
          add: "/sys/sysDepart/add",
        },
        dictDisabled:true,
      }
    },
    created () {
    },
    methods: {
      loadTreeData(){
        var that = this;
        queryIdTree().then((res)=>{
          if(res.success){
            that.departTree = [];
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i];
              that.departTree.push(temp);
            }
          }

        })
      },
      add (depart) {
        if(depart){
          this.seen = false;
          this.dictDisabled = false;
        }else{
          this.seen = true;
          this.dictDisabled = true;
        }
        this.edit(depart);
      },
      edit (record) {
          this.form.resetFields();
          this.model = Object.assign({}, {});
          this.visible = true;
          this.loadTreeData();
          this.model.parentId = record!=null?record.toString():null;
          if(this.seen){
            this.model.orgCategory = '1';
          }else{
            this.model.orgCategory = '2';
          }
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'orgCategory','departName','departNameEn','departNameAbbr','departOrder','description','orgType','orgCode','mobile','fax','address','memo','status','delFlag'))
          });
      },
      close () {
        this.$emit('close');
        this.disableSubmit = false;
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let formData = Object.assign(this.model, values);
            //時間のフォーマット
            console.log(formData)
            httpAction(this.url.add,formData,"post").then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadTreeData();
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })

          }
        })
      },
      handleCancel () {
        this.close()
      },
      validateMobile(rule,value,callback){
        if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)){
          callback();
        }else{
          callback("あなたの携帯電話番号のフォーマットが間違っています！");
        }

      }
    }
  }
</script>

<style scoped>

</style>