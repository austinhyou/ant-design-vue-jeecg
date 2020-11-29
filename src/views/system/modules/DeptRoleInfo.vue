<template>
  <a-card :bordered="false">
    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <!-- 検索エリア -->
      <a-form layout="inline">
        <a-row :gutter="10">
          <a-col :md="10" :sm="12">
            <a-form-item label="部門の役割名" style="margin-left:8px">
              <a-input placeholder="部門の役割を入力してください" v-model="queryParam.roleName"></a-input>
            </a-form-item>
          </a-col>
          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
              <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 18px">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <!-- 操作ボタンエリア -->
    <div class="table-operator" :md="24" :sm="24">
      <a-button @click="handleAdd" type="primary" icon="plus">新しい部門の役割</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>削除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>
    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択された <a style="font-weight: 600">
          {{selectedRowKeys.length }}</a>項目
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
                <a @click="handlePerssion(record)">授権</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
             </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- テーブルエリア-end -->
    <!-- フォームエリア -->
    <sys-depart-role-modal ref="modalForm" @ok="modalFormOk"/>
    <dept-role-auth-modal ref="modalDeptRole" />
  </a-card>
</template>

<script>
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {getAction} from '@/api/manage'
  import SysDepartRoleModal from './SysDepartRoleModal'
  import DeptRoleAuthModal from './DeptRoleAuthModal'

  export default {
    name: 'DeptRoleInfo',
    components: { DeptRoleAuthModal, SysDepartRoleModal },
    mixins: [JeecgListMixin],
    data() {
      return {
        description: '部門の役割情報',
        currentDeptId: '',
        // トップ
        columns: [{
          title: '部門の役割名',
          align: "center",
          dataIndex: 'roleName'
        },
        {
          title: '部門の役割コード',
          align: "center",
          dataIndex: 'roleCode'
        },
        {
          title: '部門',
          align: "center",
          dataIndex: 'departId_dictText'
        },
        {
          title: '備考',
          align: "center",
          dataIndex: 'description'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {customRender: 'action'},
          align: "center",
          width: 170
        }],
        url: {
          list: "/sys/sysDepartRole/list",
          delete: "/sys/sysDepartRole/delete",
          deleteBatch: "/sys/sysDepartRole/deleteBatch",
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
        let params = this.getQueryParams();//クエリ条件
        params.deptId = this.currentDeptId;
        getAction(this.url.list, params).then((res) => {
          if (res.success && res.result) {
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      open(record) {
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
      handleEdit: function (record) {
        this.$refs.modalForm.title = "編集";
        this.$refs.modalForm.departDisabled = true;
        this.$refs.modalForm.disableSubmit = false;
        this.$refs.modalForm.edit(record,record.departId);
      },
      handleAdd: function () {
        if (this.currentDeptId == '') {
          this.$message.error("部門を選択してください！")
        } else {
          this.$refs.modalForm.departDisabled = true;
          this.$refs.modalForm.add(this.currentDeptId);
          this.$refs.modalForm.title = "追加";
        }
      },
      handlePerssion: function(record){
        this.$refs.modalDeptRole.show(record.id,record.departId);
      },
    }
  }
</script>

<style scoped>

</style>