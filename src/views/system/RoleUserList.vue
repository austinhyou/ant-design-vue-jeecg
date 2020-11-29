<template>
  <a-row :gutter="10">
    <a-col :md="leftColMd" :sm="24" style="margin-bottom: 20px">
      <a-card :bordered="false">
        <!-- クエリエリア -->
        <div class="table-page-search-wrapper">
          <!-- 検索エリア -->
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="24">
              <a-col :md="12" :sm="8">
                <a-form-item label="役割名" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <a-input placeholder="" v-model="queryParam.roleName"></a-input>
                </a-form-item>
              </a-col>
              <!--
              <a-col :md="11" :sm="12">
                <a-form-item label="作成時間" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="開始時間を選択してください" ></j-date>
                  <span style="width: 10px;">~</span>
                  <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="終了時間を選択してください"></j-date>
                </a-form-item>
              </a-col>
              -->
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="12" :sm="24">
               <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 21px">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </a-col>
          </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作ボタンエリア -->
        <div class="table-operator" style="margin: 5px 0 10px 2px">
          <a-button @click="handleAdd" type="primary" icon="plus">新しい役割</a-button>
          <!--<a-button @click="handleEdit(model1)" type="primary" icon="plus">役割編集</a-button>-->
          <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
            <a-button type="primary" icon="import">インポート</a-button>
          </a-upload>
          <a-button type="primary" icon="download" @click="handleExportXls('役割管理')">エクスポート</a-button>
        </div>

        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <i class="anticon anticon-info-circle ant-alert-icon">
          </i> 選択された <a><b>{{ selectedRowKeys1.length }}</b></a>項目
          <a style="margin-left: 24px" @click="onClearSelected1">クリア</a>
        </div>

        <div style="margin-top: 15px">
          <a-table
            style="height:500px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            :rowSelection="{selectedRowKeys: selectedRowKeys1, onChange: onSelectChange1, type:'radio'}"
            @change="handleTableChange">
          <span slot="action" slot-scope="text, record">
            <a @click="handleOpen(record)">ユーザー</a>
            <a-divider type="vertical"/>

            <a-dropdown>
              <a class="ant-dropdown-link">
                もっと <a-icon type="down"/>
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handlePerssion(record.id)">認証</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleEdit(record)">編集</a>
                </a-menu-item>
                <a-menu-item>
                  <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete1(record.id)">
                    <a>削除</a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
        </span>
          </a-table>
        </div>
        <!-- 右側の役割権限の構成 -->
        <user-role-modal ref="modalUserRole"></user-role-modal>
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
      </a-card>
    </a-col>
    <a-col :md="rightColMd" :sm="24" v-if="this.rightcolval == 1">
      <a-card :bordered="false">
        <div style="text-align: right;">
          <a-icon type="close-circle" @click="hideUserList" />
        </div>
        <!-- クエリエリア -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="24">

              <a-col :md="12" :sm="12">
                <a-form-item label="ユーザーアカウント">
                  <a-input placeholder="" v-model="queryParam2.username"></a-input>
                </a-form-item>
              </a-col>
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="9" :sm="24">
             <a-button type="primary" @click="searchQuery2" icon="search" style="margin-left: 21px">クエリ</a-button>
              <a-button type="primary" @click="searchReset2" icon="reload" style="margin-left: 8px">リセット</a-button>

            </a-col>
          </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作ボタンエリア -->
        <div class="table-operator" :md="24" :sm="24">
          <a-button @click="handleAdd2" type="primary" icon="plus" style="margin-top: 16px">新規ユーザー</a-button>
          <!--<a-button @click="handleEdit2" type="primary" icon="edit" style="margin-top: 16px">ユーザー編集</a-button>-->
          <a-button @click="handleAddUserRole" type="primary" icon="plus" style="margin-top: 16px">既存のユーザー</a-button>

          <a-dropdown v-if="selectedRowKeys2.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel2">
                <a-icon type="delete"/>
                削除
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
            selectedRowKeys2.length }}</a>項目
            <a style="margin-left: 24px" @click="onClearSelected2">クリア</a>
          </div>
          <a-table
            style="height:500px"
            ref="table2"
            bordered
            size="middle"
            rowKey="id"
            :columns="columns2"
            :dataSource="dataSource2"
            :pagination="ipagination2"
            :loading="loading2"
            :rowSelection="{selectedRowKeys: selectedRowKeys2, onChange: onSelectChange2}"
            @change="handleTableChange2">
           <span slot="action" slot-scope="text, record">
           <a @click="handleEdit2(record)">編集</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              もっと <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete2(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
          </a-table>
        </div>
        <!-- フォームエリア -->
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
        <user-modal ref="modalForm2" @ok="modalFormOk2"></user-modal>
        <Select-User-Modal ref="selectUserModal" @selectFinished="selectOK"></Select-User-Modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import SelectUserModal from './modules/SelectUserModal'
  import RoleModal from './modules/RoleModal'
  import UserModal from './modules/UserModal'
  import { filterObj } from '@/utils/util'
  import UserRoleModal from './modules/UserRoleModal'
  import moment from 'moment'

  export default {
    name: 'RoleUserList',
    mixins: [JeecgListMixin],
    components: {
      UserRoleModal,
      SelectUserModal,
      RoleModal,
      UserModal,
      moment
    },
    data() {
      return {
        model1: {},
        model2: {},
        currentRoleId: '',
        queryParam1: {},
        queryParam2: {},
        dataSource1: [],
        dataSource2: [],
        ipagination1: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 合計' + total + '部'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        ipagination2: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 合計' + total + '部'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter1: {
          column: 'createTime',
          order: 'desc'
        },
        isorter2: {
          column: 'createTime',
          order: 'desc'
        },
        filters1: {},
        filters2: {},
        loading1: false,
        loading2: false,
        selectedRowKeys1: [],
        selectedRowKeys2: [],
        selectionRows1: [],
        selectionRows2: [],
        test:{},
        rightcolval:0,
        columns:
          [
            {
              title: '役割番号',
              align: 'center',
              dataIndex: 'roleCode'
            },
            {
              title: '役割名',
              align: 'center',
              dataIndex: 'roleName'
            },
            {
              title: '作成時間',
              dataIndex: 'createTime',
              align:"center",
              sorter: true,
              customRender: (text) => {
                return moment(text).format('YYYY-MM-DD')
              }
            },
            {
              title: '操作',
              dataIndex: 'action',
              align: 'center',
              scopedSlots: { customRender: 'action' }
            }
          ],
        columns2: [{
          title: 'ユーザーアカウント',
          align: 'center',
          dataIndex: 'username',
          width: 120
        },
          {
            title: 'ユーザー名',
            align: 'center',
            width: 100,
            dataIndex: 'realname'
          },
          {
            title: '状態',
            align: 'center',
            width: 80,
            dataIndex: 'status_dictText'
          },

          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 120
          }],

        // 高度なクエリパラメータ
        superQueryParams2: '',
        // 高度なクエリスプライシング条件
        superQueryMatchType2: 'and',
        url: {
          list: '/sys/role/list',
          delete: '/sys/role/delete',
          list2: '/sys/user/userRoleList',
          addUserRole: '/sys/user/addSysUserRole',
          delete2: '/sys/user/deleteUserRole',
          deleteBatch2: '/sys/user/deleteUserRoleBatch',
          exportXlsUrl: 'sys/role/exportXls',
          importExcelUrl: 'sys/role/importExcel'
        }
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      },
      leftColMd() {
        return this.selectedRowKeys1.length === 0 ? 24 : 12
      },
      rightColMd() {
        return this.selectedRowKeys1.length === 0 ? 0 : 12
      }
    },
    methods: {
      onSelectChange2(selectedRowKeys, selectionRows) {
        this.selectedRowKeys2 = selectedRowKeys
        this.selectionRows2 = selectionRows
      },
      onClearSelected2() {
        this.selectedRowKeys2 = []
        this.selectionRows2 = []
      },
      onClearSelected1() {
        this.selectedRowKeys1 = []
        this.selectionRows1 = []
      },
      onSelectChange1(selectedRowKeys, selectionRows) {
        this.rightcolval = 1
        this.selectedRowKeys1 = selectedRowKeys
        this.selectionRows1 = selectionRows
        this.model1 = Object.assign({}, selectionRows[0])
        console.log(this.model1)
        this.currentRoleId = selectedRowKeys[0]
        this.loadData2()
      },
      onClearSelected() {
      },

      getQueryParams2() {
        //クエリ条件を取得する
        let sqp = {}
        if (this.superQueryParams2) {
          sqp['superQueryParams'] = encodeURI(this.superQueryParams2)
          sqp['superQueryMatchType'] = this.superQueryMatchType2
        }
        var param = Object.assign(sqp, this.queryParam2, this.isorter2, this.filters2)
        param.field = this.getQueryField2()
        param.pageNo = this.ipagination2.current
        param.pageSize = this.ipagination2.pageSize
        return filterObj(param)
      },
      getQueryField2() {
        //TODO フィールドパーミッションコントロール
        var str = 'id,'
        this.columns2.forEach(function(value) {
          str += ',' + value.dataIndex
        })
        return str
      },
      handleEdit2: function(record) {
        this.$refs.modalForm2.title = '編集'
        this.$refs.modalForm2.roleDisabled = true
        this.$refs.modalForm2.edit(record)
      },
      handleAdd2: function() {
        if (this.currentRoleId == '') {
          this.$message.error('役割を選択してください')
        } else {
          this.$refs.modalForm2.roleDisabled = true
          this.$refs.modalForm2.selectedRole = [this.currentRoleId]

          this.$refs.modalForm2.add()

          this.$refs.modalForm2.title = '追加'
        }
      },
      modalFormOk2() {
        // 追加/変更が成功したら、リストをリロードします
        this.loadData2()
      },
      loadData2(arg) {
        if (!this.url.list2) {
          this.$message.error('url.list2プロパティを設定してください')
          return
        }
        //データのロードパラメータ1が渡されると、最初のページのコンテンツがロードされます
        if (arg === 1) {
          this.ipagination2.current = 1
        }
        if (this.currentRoleId === '') return
        let params = this.getQueryParams2()//クエリ条件
        params.roleId = this.currentRoleId
        this.loading2 = true
        getAction(this.url.list2, params).then((res) => {
          if (res.success) {
            this.dataSource2 = res.result.records
            this.ipagination2.total = res.result.total

          }
          this.loading2 = false
        })

      },
      handleDelete1: function(id) {
        this.handleDelete(id)
        this.dataSource2 = []
        this.currentRoleId = ''
      },
      handleDelete2: function(id) {
        if (!this.url.delete2) {
          this.$message.error('url.delete2プロパティを設定してください')
          return
        }
        var that = this
        deleteAction(that.url.delete2, { roleId: this.currentRoleId, userId: id }).then((res) => {
          if (res.success) {
            that.$message.success(res.message)
            that.loadData2()
          } else {
            that.$message.warning(res.message)
          }
        })
      },
      batchDel2: function() {

        if (!this.url.deleteBatch2) {
          this.$message.error('url.deleteBatch2プロパティを設定してください')
          return
        }
        if (this.selectedRowKeys2.length <= 0) {
          this.$message.warning('レコードを選択してください')
          return
        } else {
          var ids = ''
          for (var a = 0; a < this.selectedRowKeys2.length; a++) {
            ids += this.selectedRowKeys2[a] + ','
          }
          var that = this
          console.log(this.currentDeptId)
          this.$confirm({
            title: '削除を確認する',
            content: '選択したデータを削除するかどうか？',
            onOk: function() {
              deleteAction(that.url.deleteBatch2, { roleId: that.currentRoleId, userIds: ids }).then((res) => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.loadData2()
                  that.onClearSelected()
                } else {
                  that.$message.warning(res.message)
                }
              })
            }
          })
        }
      },
      selectOK(data) {
        let params = {}
        params.roleId = this.currentRoleId
        params.userIdList = []
        for (var a = 0; a < data.length; a++) {
          params.userIdList.push(data[a])
        }
        console.log(params)
        postAction(this.url.addUserRole, params).then((res) => {
          if (res.success) {
            this.loadData2()
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        })
      },

      handleAddUserRole() {
        if (this.currentRoleId == '') {
          this.$message.error('役割を選択してください')
        } else {
          this.$refs.selectUserModal.visible = true
        }
      },
      handleOpen(record) {
        this.rightcolval = 1
        this.selectedRowKeys1 = [record.id]
        this.model1 = Object.assign({}, record)
        this.currentRoleId = record.id
        this.onClearSelected2()
        this.loadData2()
      },
      /*handleEdit: function(record) {
        if (this.currentRoleId == '') {
          this.$message.error('役割を選択してください')
        } else {
          this.$refs.modalForm.edit(record)
          this.$refs.modalForm.title = '編集'
        }
      },*/
      searchQuery2() {
        this.loadData2(1)
      },
      searchReset2() {
        this.queryParam2 = {}
        this.loadData2(1)
      },
      handleTableChange2(pagination, filters, sorter) {
        //変更のページング、並べ替え、およびスクリーニング変化時に触発されます
        //TODO スクリーニング
        if (Object.keys(sorter).length > 0) {
          this.isorter2.column = sorter.field
          this.isorter2.order = 'ascend' == sorter.order ? 'asc' : 'desc'
        }
        this.ipagination2 = pagination
        this.loadData2()
      },
      hideUserList(){
        //this.rightcolval = 0
        this.selectedRowKeys1 = []
      },
      handlePerssion(roleId){
        this.$refs.modalUserRole.show(roleId);
      },
    }
  }
</script>
<style scoped>
  /** Buttonボタンの間隔 */
  .ant-btn {
    margin-left: 8px
  }
</style>