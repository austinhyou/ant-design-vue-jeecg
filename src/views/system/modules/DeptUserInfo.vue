<template>
  <a-card :bordered="false">
    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <!-- 検索エリア -->
      <a-form layout="inline">
        <a-row :gutter="10">
          <a-col :md="10" :sm="12">
            <a-form-item label="ユーザーアカウント" style="margin-left:8px">
              <a-input placeholder="アカウントを入力してください" v-model="queryParam.username"></a-input>
            </a-form-item>
          </a-col>
          <!--<a-col :md="8" :sm="8">-->
          <!--<a-form-item label="ユーザー名" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">-->
          <!--<a-input placeholder="名前クエリを入力してください" v-model="queryParam.realname"></a-input>-->
          <!--</a-form-item>-->
          <!--</a-col>-->
          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
             <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 18px">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <!--操作ボタンエリア -->
    <div class="table-operator" :md="24" :sm="24" style="margin-top: -15px">
      <!--<a-button @click="handleEdit" type="primary" icon="edit" style="margin-top: 16px">ユーザー編集</a-button>-->
      <a-button @click="handleAddUserDepart" type="primary" icon="plus">既存のユーザーを追加する</a-button>
      <a-button @click="handleAdd" type="primary" icon="plus" style="margin-top: 16px">新規ユーザー</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            リンクを解除する
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択された <a style="font-weight: 600">{{
        selectedRowKeys.length }}</a>項目
        <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">



        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>

          <a-divider type="vertical"/>

          <a-dropdown>
            <a class="ant-dropdown-link">
              もっと <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
                <a-menu-item>
                <a href="javascript:;" @click="handleDeptRole(record)">部門の役割を割り当てる</a>
              </a-menu-item>

              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">ユーザー詳細</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="選択した部門のリンクを解除してもよろしいですか？" @confirm="() => handleDelete(record.id)">
                  <a>リンクを解除する</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>


      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>
    <Select-User-Modal ref="selectUserModal" @selectFinished="selectOK"></Select-User-Modal>
    <dept-role-user-modal ref="deptRoleUser"></dept-role-user-modal>
  </a-card>
</template>

<script>
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {getAction, postAction, deleteAction} from '@/api/manage'
  import SelectUserModal from './SelectUserModal'
  import UserModal from './UserModal'
  import DeptRoleUserModal from './DeptRoleUserModal'

  export default {
    name: "DeptUserInfo",
    mixins: [JeecgListMixin],
    components: {
      DeptRoleUserModal,
      SelectUserModal,
      UserModal
    },
    data() {
      return {
        description: 'ユーザー情報',
        currentDeptId: '',
        // トップ
        columns: [{
            title: 'ユーザーアカウント',
            align: "center",
            dataIndex: 'username'
          },
          {
            title: 'ユーザー名',
            align: "center",
            dataIndex: 'realname'
          },
          {
            title: '部門',
            align: "center",
            dataIndex: 'orgCode'
          },
          {
            title: '性別',
            align: "center",
            dataIndex: 'sex_dictText'
          },
          {
            title: '電話番号',
            align: "center",
            dataIndex: 'phone'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 150
          }],
        url: {
          list: "/sys/user/departUserList",
          edit: "/sys/user/editSysDepartWithUser",
          delete: "/sys/user/deleteUserInDepart",
          deleteBatch: "/sys/user/deleteUserInDepartBatch",
        }
      }
    },
    created() {
    },

    methods: {
      searchReset() {
        this.queryParam = {}
        this.loadData(1);
      },
      loadData(arg) {
        if (!this.url.list) {
          this.$message.error("url.list属性を設定してください！")
          return
        }
        //データのロードパラメータ1が渡されると、最初のページのコンテンツがロードされます
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        //if (this.currentDeptId === '') return;
        let params = this.getQueryParams();//クエリ条件
        params.depId = this.currentDeptId;
        getAction(this.url.list, params).then((res) => {
          if (res.success && res.result) {
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      batchDel: function () {

        if (!this.url.deleteBatch) {
          this.$message.error("url.deleteBatch属性を設定してください！")
          return
        }
        if (!this.currentDeptId) {
          this.$message.error("部門が選択されていない場合、部門とユーザーの関連付けをキャンセルすることはできません。")
          return
        }

        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('レコードを選択してください！');
          return;
        } else {
          var ids = "";
          for (var a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ",";
          }
          var that = this;
          console.log(this.currentDeptId);
          this.$confirm({
            title: "キャンセルの確認",
            content: "ユーザーと選択した部門との関連付けをキャンセルしますか？",
            onOk: function () {
              deleteAction(that.url.deleteBatch, {depId: that.currentDeptId, userIds: ids}).then((res) => {
                if (res.success) {
                  that.$message.success("ユーザーと選択した部門の関係を正常に削除します。");
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              });
            }
          });
        }
      },
      handleDelete: function (id) {
        if (!this.url.delete) {
          this.$message.error("url.delete属性を設定してください！")
          return
        }
        if (!this.currentDeptId) {
          this.$message.error("部門が選択されていない場合、部門とユーザーの関連付けをキャンセルすることはできません。")
          return
        }

        var that = this;
        deleteAction(that.url.delete, {depId: this.currentDeptId, userId: id}).then((res) => {
          if (res.success) {
            that.$message.success("ユーザーと選択した部門の関係を正常に削除します。");
            if (this.selectedRowKeys.length>0){
               for(let i =0; i<this.selectedRowKeys.length;i++){
                   if (this.selectedRowKeys[i] == id){
                     this.selectedRowKeys.splice(i,1);
                     break;
                   }
               }
            }
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      open(record) {
        //console.log(record);
        this.currentDeptId = record.id;
        this.loadData(1);
      },
      clearList() {
        this.currentDeptId = '';
        this.dataSource = [];
      },
      hasSelectDept() {
        if (this.currentDeptId == '') {
          this.$message.error("部門を選択してください！")
          return false;
        }
        return true;
      },
      handleAddUserDepart() {
        if (this.currentDeptId == '' ) {
          this.$message.error("部門を選択してください！")
        } else {
          this.$refs.selectUserModal.visible = true;
        }
      },
      handleEdit: function (record) {
        this.$refs.modalForm.title = "編集";
        this.$refs.modalForm.departDisabled = true;
        this.$refs.modalForm.disableSubmit = false;
        this.$refs.modalForm.edit(record);
      },
      handleAdd: function () {
        if (this.currentDeptId == '') {
          this.$message.error("部門を選択してください！")
        } else {
          this.$refs.modalForm.departDisabled = true;
          this.$refs.modalForm.userDepartModel.departIdList = [this.currentDeptId];  //部門IDを渡す
          this.$refs.modalForm.add();
          this.$refs.modalForm.title = "追加";
        }
      },
      selectOK(data) {
        let params = {};
        params.depId = this.currentDeptId;
        params.userIdList = [];
        for (var a = 0; a < data.length; a++) {
          params.userIdList.push(data[a]);
        }
        console.log(params);
        postAction(this.url.edit, params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData();
          } else {
            this.$message.warning(res.message);
          }
        })
      },
      handleDeptRole(record){
        if(this.currentDeptId != ''){
          this.$refs.deptRoleUser.add(record,this.currentDeptId);
          this.$refs.deptRoleUser.title = "部門の役割の割り当て";
        }else{
          this.$message.warning("最初に部門を選択してください！");
        }
      }
    }
  }
</script>
<style scoped>
  /** Buttonボタンの間隔 */
  .ant-btn {
    margin-left: 3px
  }

  .ant-card {
    margin-left: -30px;
    margin-right: -30px;
  }

  .table-page-search-wrapper {
    margin-top: -16px;
    margin-bottom: 16px;
  }
</style>