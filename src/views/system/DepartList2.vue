<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <!--
   -->
    <!-- 操作ボタンエリア-->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            削除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ削除
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <i class="anticon anticon-info-circle ant-alert-icon"></i> 選択された <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>項目
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
            <a class="ant-dropdown-link">もっと <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">詳細</a>
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
    <sysDepart-modal ref="sysDepartModal" @ok="modalFormOk"></sysDepart-modal>
  </a-card>
</template>

<script>
  import SysDepartModal from './modules/DepartModal'
  /*  import { filterObj } from '@/utils/util'
    , queryByFactories*/
  import {queryDepartTreeList} from '@/api/api'
  import {deleteAction} from '@/api/manage'

  // トップ
  const columns = [
    {
      title: '機関名',
      dataIndex: 'departName',
    },
    {
      title: '機関タイプ',
      align: "center",
      dataIndex: 'orgType'
    },
    {
      title: '機関コード',
      dataIndex: 'orgCode'
    },
    {
      title: '電話番号',
      dataIndex: 'mobile'
    },
    {
      title: 'ファックス',
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
      align: "center",
      dataIndex: 'action',
      scopedSlots: {customRender: 'action'},
    }
  ];

  export default {
    name: "DepartList2",
    components: {
      SysDepartModal
    },
    data() {
      return {
        description: 'jeecgはSysDepartコード管理ページを生成します',
        // クエリ条件
        queryParam: {},
        //データセット
        factories: '',
        dataSource: [],
        columns: columns,
        // ページングパラメータ
        /*        ipagination:{
                  current: 1,
                  pageSize: 5,
                  pageSizeOptions: ['5', '10', '20'],
                  showTotal: (total, range) => {
                    return range[0] + "-" + range[1] + "合計" + total + "部"
                  },
                  showQuickJumper: true,
                  showSizeChanger: true,
                  total: 0
                },*/
        isorter: {
          column: 'createTime',
          order: 'desc',
        },
        loading: false,
        selectedRowKeys: [],
        selectedRows: [],
        url: {
          list: "/sys/sysDepart/list",
          delete: "/sys/sysDepart/delete",
          deleteBatch: "/sys/sysDepart/deleteBatch",
        },

      }
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        this.dataSource = [];
        queryDepartTreeList().then((res) => {
          if (res.success) {
            this.dataSource = res.result;
          }
        })

      },

      getQueryField() {
        //TODO フィールドパーミッションコントロール
        var str = "id,";
        for (var a = 0; a < this.columns.length; a++) {
          str += "," + this.columns[a].dataIndex;
        }
        return str;
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
      },
      onClearSelected() {
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
//TODO getQueryParams
      handleDelete: function (id) {
        var that = this;
        deleteAction(that.url.delete, {id: id}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleDetail(record) {
        this.$refs.sysDepartModal.edit(record);
        this.$refs.sysDepartModal.title = "詳細";
        this.$refs.sysDepartModal.disableSubmit = true;
      },
      batchDel: function () {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('レコードを選択してください');
          return;
        } else {
          var ids = "";
          for (var a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ",";
          }
          var that = this;
          this.$confirm({
            title: "削除を確認する",
            content: "選択したデータを削除するかどうか？",
            onOk: function () {
              deleteAction(that.url.deleteBatch, {ids: ids}).then((res) => {
                if (res.success) {
                  that.$message.success(res.message);
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
      handleEdit: function (record) {
        this.$refs.sysDepartModal.edit(record);
        this.$refs.sysDepartModal.title = "編集";
      },
      handleAdd() {
        this.$refs.sysDepartModal.add();
        this.$refs.sysDepartModal.title = "追加";
      },
      handleTableChange(pagination, filters, sorter) {
        //変更のページング、並べ替え、およびスクリーニング変化時に触発されます
        console.log(sorter);
        //TODO スクリーニング
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
        }
        /*this.ipagination = pagination;*/
        this.loadData();
      },
      modalFormOk() {
        // 追加/変更が成功したら、リストをリロードします
        this.loadData();
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>