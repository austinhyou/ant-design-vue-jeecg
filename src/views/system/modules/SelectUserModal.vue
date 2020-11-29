<template>
  <div>
    <a-modal
      centered
      :title="title"
      :width="1000"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="クローズ">


      <!-- クエリエリア -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline"  @keyup.enter.native="searchQuery">
          <a-row :gutter="24">

            <a-col :span="10">
              <a-form-item label="ユーザーアカウント">
                <a-input placeholder="ユーザーアカウントを入力してください" v-model="queryParam.username"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
                    <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                      <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
                      <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
                    </span>
            </a-col>

          </a-row>
        </a-form>
      </div>
      <!-- テーブルエリア-begin -->
      <div>
        <a-table
          size="small"
          bordered
          rowKey="id"
          :columns="columns1"
          :dataSource="dataSource1"
          :pagination="ipagination"
          :loading="loading"
          :scroll="{ y: 240 }"
          :rowSelection="{selectedRowKeys: selectedRowKeys,onSelectAll:onSelectAll,onSelect:onSelect,onChange: onSelectChange}"
          @change="handleTableChange">

        </a-table>
      </div>
      <!-- テーブルエリア-end -->


    </a-modal>
  </div>
</template>

<script>
  import {filterObj} from '@/utils/util'
  import {getAction} from '@/api/manage'

  export default {
    name: "SelectUserModal",
    data() {
      return {
        title: "既存のユーザーを追加する",
        names: [],
        visible: false,
        placement: 'right',
        description: '',
        // クエリ条件
        queryParam: {},
        // トップ
        columns1: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 50,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: 'ユーザーアカウント',
            align: "center",
            width: 100,
            dataIndex: 'username'
          },
          {
            title: 'ユーザー名',
            align: "center",
            width: 100,
            dataIndex: 'realname'
          },
          {
            title: '性別',
            align: "center",
            width: 100,
            dataIndex: 'sex_dictText'
          },
          {
            title: '電話番号',
            align: "center",
            width: 100,
            dataIndex: 'phone'
          },
          {
            title: '部門',
            align: "center",
            width: 150,
            dataIndex: 'orgCode'
          }
        ],
        columns2: [
          {
            title: 'ユーザーアカウント',
            align: "center",
            dataIndex: 'username',

          },
          {
            title: 'ユーザー名',
            align: "center",
            dataIndex: 'realname',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            width: 100,
            scopedSlots: {customRender: 'action'},
          }
        ],
        //データセット
        dataSource1: [],
        dataSource2: [],
        // ページングパラメータ
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 合計" + total + "部"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter: {
          column: 'createTime',
          order: 'desc',
        },
        loading: false,
        selectedRowKeys: [],
        selectedRows: [],
        url: {
          list: "/sys/user/list",
        }
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      searchQuery() {
        this.loadData(1);
      },
      searchReset() {
        this.queryParam = {};
        this.loadData(1);
      },
      handleCancel() {
        this.visible = false;
      },
      handleOk() {
        this.dataSource2 = this.selectedRowKeys;
        console.log("data:" + this.dataSource2);
        this.$emit("selectFinished", this.dataSource2);
        this.visible = false;
      },
      add() {
        this.visible = true;
      },
      loadData(arg) {
        //データのロードパラメータ1が渡されると、最初のページのコンテンツがロードされます
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//クエリ条件
        getAction(this.url.list, params).then((res) => {
          if (res.success) {
            this.dataSource1 = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      getQueryParams() {
        var param = Object.assign({}, this.queryParam, this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      getQueryField() {
        //TODO フィールドパーミッションコントロール
      },
      onSelectAll(selected, selectedRows, changeRows) {
        if (selected === true) {
          for (var a = 0; a < changeRows.length; a++) {
            this.dataSource2.push(changeRows[a]);
          }
        } else {
          for (var b = 0; b < changeRows.length; b++) {
            this.dataSource2.splice(this.dataSource2.indexOf(changeRows[b]), 1);
          }
        }
        // console.log(selected, selectedRows, changeRows);
      },
      onSelect(record, selected) {
        if (selected === true) {
          this.dataSource2.push(record);
        } else {
          var index = this.dataSource2.indexOf(record);
          //console.log();
          if (index >= 0) {
            this.dataSource2.splice(this.dataSource2.indexOf(record), 1);
          }

        }
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectedRows;
      },
      onClearSelected() {
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
      handleDelete: function (record) {
        this.dataSource2.splice(this.dataSource2.indexOf(record), 1);
      },
      handleTableChange(pagination, filters, sorter) {
        //変更のページング、並べ替え、およびスクリーニング変化時に触発されます
        console.log(sorter);
        //TODO スクリーニング
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
        }
        this.ipagination = pagination;
        this.loadData();
      }
    }
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .ant-table-tbody .ant-table-row td {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
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
</style>