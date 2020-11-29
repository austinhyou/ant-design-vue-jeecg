<template xmlns:background-color="http://www.w3.org/1999/xhtml">
  <a-row :gutter="10">
    <a-col :md="12" :sm="24">
      <a-card :bordered="false">

        <!-- 按钮操作区域 -->
        <a-row style="margin-left: 14px">
          <a-button @click="handleAdd(1)" type="primary">部門を追加</a-button>
          <a-button @click="handleAdd(2)" type="primary">部下を追加</a-button>
          <a-button type="primary" icon="download" @click="handleExportXls('部門情報')">エクスポート</a-button>
          <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
            <a-button type="primary" icon="import">インポート</a-button>
          </a-upload>
          <a-button title="複数のデータを削除する" @click="batchDel" type="default">バッチ削除</a-button>
          <!--<a-button @click="refresh" type="default" icon="reload" :loading="loading">更新</a-button>-->
        </a-row>
        <div style="background: #fff;padding-left:16px;height: 100%; margin-top: 5px">
          <a-alert type="info" :showIcon="true">
            <div slot="message">
              現在の選択：<span v-if="this.currSelected.title">{{ getCurrSelectedTitle() }}</span>
              <a v-if="this.currSelected.title" style="margin-left: 10px" @click="onClearSelected">選択をキャンセル</a>
            </div>
          </a-alert>
          <a-input-search @search="onSearch" style="width:100%;margin-top: 10px" placeholder="部門名を入力してください"/>
          <!-- ツリー-->
          <a-col :md="10" :sm="24">
            <template>
              <a-dropdown :trigger="[this.dropTrigger]" @visibleChange="dropStatus">
               <span style="user-select: none">
            <a-tree
              checkable
              multiple
              @select="onSelect"
              @check="onCheck"
              @rightClick="rightHandle"
              :selectedKeys="selectedKeys"
              :checkedKeys="checkedKeys"
              :treeData="departTree"
              :checkStrictly="checkStrictly"
              :expandedKeys="iExpandedKeys"
              :autoExpandParent="autoExpandParent"
              @expand="onExpand"/>
                </span>
                <!--右クリックイベントを追加し、追加および削除機能を追加しました-->
                <a-menu slot="overlay">
                  <a-menu-item @click="handleAdd(3)" key="1">追加</a-menu-item>
                  <a-menu-item @click="handleDelete" key="2">削除</a-menu-item>
                  <a-menu-item @click="closeDrop" key="3">キャンセル</a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          </a-col>
        </div>
      </a-card>
      <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
      <div class="drawer-bootom-button">
        <a-dropdown :trigger="['click']" placement="topCenter">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="switchCheckStrictly(1)">親子リンク</a-menu-item>
            <a-menu-item key="2" @click="switchCheckStrictly(2)">リンクを解除する</a-menu-item>
            <a-menu-item key="3" @click="checkALL">すべてチェック</a-menu-item>
            <a-menu-item key="4" @click="cancelCheckALL">すべて選択解除</a-menu-item>
            <a-menu-item key="5" @click="expandAll">すべて展開</a-menu-item>
            <a-menu-item key="6" @click="closeAll">すべてをマージ</a-menu-item>
          </a-menu>
          <a-button>
            ツリー操作 <a-icon type="up" />
          </a-button>
        </a-dropdown>
      </div>
      <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
    </a-col>
    <a-col :md="12" :sm="24">
      <a-tabs defaultActiveKey="1">
        <a-tab-pane tab="基本情報" key="1" >
          <a-card :bordered="false" v-if="selectedKeys.length>0">
            <a-form :form="form">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="機関名">
                <a-input placeholder="機関/部門の名前を入力してください" v-decorator="['departName', validatorRules.departName ]"/>
              </a-form-item>
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="上位部門">
                <a-tree-select
                  style="width:100%"
                  :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
                  :treeData="treeData"
                  :disabled="disable"
                  v-model="model.parentId"
                  placeholder="なし">
                </a-tree-select>
              </a-form-item>
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="機関コード">
                <a-input disabled placeholder="機関コードを入力してください" v-decorator="['orgCode', validatorRules.orgCode ]"/>
              </a-form-item>
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="機関タイプ">
                <template v-if="orgCategoryDisabled">
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
                label="ソート">
                <a-input-number v-decorator="[ 'departOrder',{'initialValue':0}]"/>
              </a-form-item>
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="電話番号">
                <a-input placeholder="電話番号を入力してください" v-decorator="['mobile', {'initialValue':''}]"/>
              </a-form-item>
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="アドレス">
                <a-input placeholder="アドレスを入力してください" v-decorator="['address', {'initialValue':''}]"/>
              </a-form-item>
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="備考">
                <a-textarea placeholder="備考を入力してください" v-decorator="['memo', {'initialValue':''}]"/>
              </a-form-item>
            </a-form>
            <div class="anty-form-btn">
              <a-button @click="emptyCurrForm" type="default" htmlType="button" icon="sync">リセット</a-button>
              <a-button @click="submitCurrForm" type="primary" htmlType="button" icon="form">保存</a-button>
            </div>
          </a-card>
          <a-card v-else >
            <a-empty>
              <span slot="description"> まずに部門を選択してください </span>
            </a-empty>
          </a-card>
        </a-tab-pane>
        <a-tab-pane tab="部門権限" key="2" forceRender>
          <depart-auth-modal ref="departAuth"/>
        </a-tab-pane>
      </a-tabs>

    </a-col>
    <depart-modal ref="departModal" @ok="loadTree"></depart-modal>
  </a-row>
</template>
<script>
  import DepartModal from './modules/DepartModal'
  import pick from 'lodash.pick'
  import {queryDepartTreeList, searchByKeywords, deleteByDepartId} from '@/api/api'
  import {httpAction, deleteAction} from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import DepartAuthModal from './modules/DepartAuthModal'
  // トップ
  const columns = [
    {
      title: '機関名',
      dataIndex: 'departName'
    },
    {
      title: '機関タイプ',
      align: 'center',
      dataIndex: 'orgType'
    },
    {
      title: '機関コード',
      dataIndex: 'orgCode',
    },
    {
      title: '電話番号',
      dataIndex: 'mobile'
    },
    {
      title: '传真',
      dataIndex: 'fax'
    },
    {
      title: 'アドレス',
      dataIndex: 'address'
    },
    {
      title: 'ソート',
      align: 'center',
      dataIndex: 'departOrder'
    },
    {
      title: '操作',
      align: 'center',
      dataIndex: 'action',
      scopedSlots: {customRender: 'action'}
    }
  ]
  export default {
    name: 'DepartList',
    mixins: [JeecgListMixin],
    components: {
      DepartAuthModal,
      DepartModal
    },
    data() {
      return {
        iExpandedKeys: [],
        loading: false,
        autoExpandParent: true,
        currFlowId: '',
        currFlowName: '',
        disable: true,
        treeData: [],
        visible: false,
        departTree: [],
        rightClickSelectedKey: '',
        rightClickSelectedOrgCode: '',
        hiding: true,
        model: {},
        dropTrigger: '',
        depart: {},
        columns: columns,
        disableSubmit: false,
        checkedKeys: [],
        selectedKeys: [],
        autoIncr: 1,
        currSelected: {},

        allTreeKeys:[],
        checkStrictly: true,

        form: this.$form.createForm(this),
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        graphDatasource: {
          nodes: [],
          edges: []
        },
        validatorRules: {
          departName: {rules: [{required: true, message: '機関/部門の名前を入力してください!'}]},
          orgCode: {rules: [{required: true, message: '機関コードを入力してください!'}]},
          orgCategory: {rules: [{required: true, message: '機関タイプを入力してください'}]},
          mobile: {rules: [{validator: this.validateMobile}]}
        },
        url: {
          delete: '/sys/sysDepart/delete',
          edit: '/sys/sysDepart/edit',
          deleteBatch: '/sys/sysDepart/deleteBatch',
          exportXlsUrl: "sys/sysDepart/exportXls",
          importExcelUrl: "sys/sysDepart/importExcel",
        },
        orgCategoryDisabled:false,
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      loadData() {
        this.refresh();
      },
      loadTree() {
        var that = this
        that.treeData = []
        that.departTree = []
        queryDepartTreeList().then((res) => {
          if (res.success) {
            //すべての部門を選択したら、部門を追加すると、選択した数が増えます
            this.allTreeKeys = [];
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i]
              that.treeData.push(temp)
              that.departTree.push(temp)
              that.setThisExpandedKeys(temp)
              that.getAllKeys(temp);
              // console.log(temp.id)
            }
            this.loading = false
          }
        })
      },
      setThisExpandedKeys(node) {
        if (node.children && node.children.length > 0) {
          this.iExpandedKeys.push(node.key)
          for (let a = 0; a < node.children.length; a++) {
            this.setThisExpandedKeys(node.children[a])
          }
        }
      },
      refresh() {
        this.loading = true
        this.loadTree()
      },
      // 右クリック操作方法
      rightHandle(node) {
        this.dropTrigger = 'contextmenu'
        console.log(node.node.eventKey)
        this.rightClickSelectedKey = node.node.eventKey
        this.rightClickSelectedOrgCode = node.node.dataRef.orgCode
      },
      onExpand(expandedKeys) {
        console.log('onExpand', expandedKeys)
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.iExpandedKeys = expandedKeys
        this.autoExpandParent = false
      },
      backFlowList() {
        this.$router.back(-1)
      },
      // ドロップダウンボックスを右クリックして、イベントを変更します
      dropStatus(visible) {
        if (visible == false) {
          this.dropTrigger = ''
        }
      },
      // ストアを右クリックしてドロップダウンし、ドロップダウンボックスを閉じます
      closeDrop() {
        this.dropTrigger = ''
      },
      addRootNode() {
        this.$refs.nodeModal.add(this.currFlowId, '')
      },
      batchDel: function () {
        console.log(this.checkedKeys)
        if (this.checkedKeys.length <= 0) {
          this.$message.warning('レコードを選択してください')
        } else {
          var ids = ''
          for (var a = 0; a < this.checkedKeys.length; a++) {
            ids += this.checkedKeys[a] + ','
          }
          var that = this
          this.$confirm({
            title: '削除を確認する',
            content: 'を削除してもよろしいですか ' + this.checkedKeys.length + ' 部データ、およびサブノードのデータを削除してもよろしいですか？',
            onOk: function () {
              deleteAction(that.url.deleteBatch, {ids: ids}).then((res) => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.loadTree()
                  that.onClearSelected()
                } else {
                  that.$message.warning(res.message)
                }
              })
            }
          })
        }
      },
      onSearch(value) {
        let that = this
        if (value) {
          searchByKeywords({keyWord: value}).then((res) => {
            if (res.success) {
              that.departTree = []
              for (let i = 0; i < res.result.length; i++) {
                let temp = res.result[i]
                that.departTree.push(temp)
              }
            } else {
              that.$message.warning(res.message)
            }
          })
        } else {
          that.loadTree()
        }

      },
      nodeModalOk() {
        this.loadTree()
      },
      nodeModalClose() {
      },
      hide() {
        console.log(111)
        this.visible = false
      },
      onCheck(checkedKeys, info) {
        console.log('onCheck', checkedKeys, info)
        this.hiding = false
        //this.checkedKeys = checkedKeys.checked
        // <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
        if(this.checkStrictly){
          this.checkedKeys = checkedKeys.checked;
        }else{
          this.checkedKeys = checkedKeys
        }
          // <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
      },
      onSelect(selectedKeys, e) {
        console.log('selected', selectedKeys, e)
        this.hiding = false
        let record = e.node.dataRef
        console.log('onSelect-record', record)
        this.currSelected = Object.assign({}, record)
        this.model = this.currSelected
        this.selectedKeys = [record.key]
        this.model.parentId = record.parentId
        this.setValuesToForm(record)
        this.$refs.departAuth.show(record.id);

      },
      // onSelectイベントがトリガーされたら、部門ツリーの右側にあるフォーム、フォームに値を割り当てます。
      setValuesToForm(record) {
        if(record.orgCategory == '1'){
          this.orgCategoryDisabled = true;
        }else{
          this.orgCategoryDisabled = false;
        }
        this.$nextTick(() => {
          this.form.getFieldDecorator('fax', {initialValue: ''})
          this.form.setFieldsValue(pick(record, 'departName','orgCategory', 'orgCode', 'departOrder', 'mobile', 'fax', 'address', 'memo'))
        })
      },
      getCurrSelectedTitle() {
        return !this.currSelected.title ? '' : this.currSelected.title
      },
      onClearSelected() {
        this.hiding = true
        this.checkedKeys = []
        this.currSelected = {}
        this.form.resetFields()
        this.selectedKeys = []
        this.$refs.departAuth.departId = ''
      },
      handleNodeTypeChange(val) {
        this.currSelected.nodeType = val
      },
      notifyTriggerTypeChange(value) {
        this.currSelected.notifyTriggerType = value
      },
      receiptTriggerTypeChange(value) {
        this.currSelected.receiptTriggerType = value
      },
      submitCurrForm() {
        this.form.validateFields((err, values) => {
          if (!err) {
            if (!this.currSelected.id) {
              this.$message.warning('変更する部門をクリックして選択してください')
              return
            }

            let formData = Object.assign(this.currSelected, values)
            console.log('Received values of form: ', formData)
            httpAction(this.url.edit, formData, 'put').then((res) => {
              if (res.success) {
                this.$message.success('正常に保存されました')
                this.loadTree()
              } else {
                this.$message.error(res.message)
              }
            })
          }
        })
      },
      emptyCurrForm() {
        this.form.resetFields()
      },
      nodeSettingFormSubmit() {
        this.form.validateFields((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values)
          }
        })
      },
      openSelect() {
        this.$refs.sysDirectiveModal.show()
      },
      handleAdd(num) {
        if (num == 1) {
          this.$refs.departModal.add()
          this.$refs.departModal.title = '追加'
        } else if (num == 2) {
          let key = this.currSelected.key
          if (!key) {
            this.$message.warning('クリックして上位部門を選択してください')
            return false
          }
          this.$refs.departModal.add(this.selectedKeys)
          this.$refs.departModal.title = '追加'
        } else {
          this.$refs.departModal.add(this.rightClickSelectedKey)
          this.$refs.departModal.title = '追加'
        }
      },
      handleDelete() {
        var that = this
        this.$confirm({
          title: '削除を確認する',
          content: 'この部門とサブノードのデータを削除してもよろしいですか？',
          onOk: function () {
            deleteByDepartId({id: that.rightClickSelectedKey}).then((resp) => {
              if (resp.success) {
                //削除が成功したら、選択したデータを削除します
                that.checkedKeys.splice(that.checkedKeys.findIndex(key => key === that.rightClickSelectedKey), 1);
                that.$message.success('正常に削除されました')
                that.loadTree()
                //削除後、右側の基本情報を同期的にクリア
                let orgCode=that.form.getFieldValue("orgCode");
                if(orgCode && orgCode === that.rightClickSelectedOrgCode){
                  that.onClearSelected()
                }
              } else {
                that.$message.warning('削除に失敗しました')
              }
            })
          }
        })
      },
      selectDirectiveOk(record) {
        console.log('選択した命令データ', record)
        this.nodeSettingForm.setFieldsValue({directiveCode: record.directiveCode})
        this.currSelected.sysCode = record.sysCode
      },
      getFlowGraphData(node) {
        this.graphDatasource.nodes.push({
          id: node.id,
          text: node.flowNodeName
        })
        if (node.children.length > 0) {
          for (let a = 0; a < node.children.length; a++) {
            let temp = node.children[a]
            this.graphDatasource.edges.push({
              source: node.id,
              target: temp.id
            })
            this.getFlowGraphData(temp)
          }
        }
      },
     // <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
      expandAll () {
        this.iExpandedKeys = this.allTreeKeys
      },
      closeAll () {
        this.iExpandedKeys = []
      },
      checkALL () {
        this.checkStriccheckStrictlytly = false
        this.checkedKeys = this.allTreeKeys
      },
      cancelCheckALL () {
        //this.checkedKeys = this.defaultCheckedKeys
        this.checkedKeys = []
      },
      switchCheckStrictly (v) {
        if(v==1){
          this.checkStrictly = false
        }else if(v==2){
          this.checkStrictly = true
        }
      },
      getAllKeys(node) {
        // console.log('node',node);
        this.allTreeKeys.push(node.key)
        if (node.children && node.children.length > 0) {
          for (let a = 0; a < node.children.length; a++) {
            this.getAllKeys(node.children[a])
          }
        }
      }
      // <!---- author:os_chengtgen -- date:20190827 --  for:親子チェックモードを切り替える =======------>
      
    },
    created() {
      this.currFlowId = this.$route.params.id
      this.currFlowName = this.$route.params.name
      // this.loadTree()
    },

  }
</script>
<style scoped>
  .ant-card-body .table-operator {
    margin: 15px;
  }

  .anty-form-btn {
    width: 100%;
    text-align: center;
  }

  .anty-form-btn button {
    margin: 0 5px;
  }

  .anty-node-layout .ant-layout-header {
    padding-right: 0
  }

  .header {
    padding: 0 8px;
  }

  .header button {
    margin: 0 3px
  }

  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }

  #app .desktop {
    height: auto !important;
  }

  /** Buttonボタンの間隔 */
  .ant-btn {
    margin-left: 3px
  }

  .drawer-bootom-button {
    /*position: absolute;*/
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: left;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
  }
</style>