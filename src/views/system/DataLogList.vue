<template>
  <a-card :bordered="false">
    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="フォーム名">
              <a-input placeholder="フォーム名を入力してください" v-model="queryParam.dataTable"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="データID">
              <a-input placeholder="IDを入力してください" v-model="queryParam.dataId"></a-input>
            </a-form-item>
          </a-col>

          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
               <a-col :md="6" :sm="24">
                  <a-button type="primary" @click="searchQuery">クエリ</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">リセット</a-button>
               </a-col>
            </span>
        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleCompare()" type="primary" icon="plus">データ比較</a-button>
    </div>

    <!--テーブルエリア -->
    <div>
      <!--選択されたクリア -->
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>選択された&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>項目&nbsp;&nbsp;
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
        :rowSelection="{selectedRowKeys: selectedRowKeys,onChange: onSelectChange}"
        @change="handleTableChange"
      >
        <!-- 長い文字列の切り捨ての省略形の表示-->
        <span slot="dataContent" slot-scope="text, record">
          <j-ellipsis :value="text" :length="80" />
        </span>
      </a-table>
    </div>
    <data-log-modal ref="modalForm" @ok="modalFormOk"></data-log-modal>
  </a-card>
</template>

<script>
  import DataLogModal from './modules/DataLogModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JEllipsis from "@/components/jeecg/JEllipsis";

  export default {
    name: 'DataLogList',
    mixins: [JeecgListMixin],
    components: {
      JEllipsis,
      DataLogModal
    },
    data() {
      return {
        description: 'データログ管理ページ',
        //トップ
        columns: [
          {
            title: 'フォーム名',
            align: 'center',
            dataIndex: 'dataTable',
            width: "120"
          }, {
            title: 'データID',
            align: 'center',
            dataIndex: 'dataId',
            width: "120"
          }, {
            title: 'バージョンナンバー',
            align: 'center',
            dataIndex: 'dataVersion',
            width: "50"
          }, {
            title: 'データコンテンツ',
            align: 'center',
            dataIndex: 'dataContent',
            width: "150",
            scopedSlots: {customRender: 'dataContent'},
          }, {
            title: '創設者',
            align: 'center',
            dataIndex: 'createBy',
            width: "100"
          },
        ],
        url: {
          list: "/sys/dataLog/list",
        },
      }
    },
    methods: {
      handleCompare: function () {
        if (!this.selectionRows || this.selectionRows.length != 2) {
          this.openNotifIcon('2つのデータを選択してください');
          return false;
        } else if (this.selectionRows[0].dataId != this.selectionRows[1].dataId) {
          this.openNotifIcon('比較のために同じデータベーステーブルとデータIDを選択してください');
          return false;
        } else {
          this.$refs.modalForm.addModal(this.selectionRows);
          this.$refs.modalForm.title = "データ比較";
        }
      },
      openNotifIcon(msg) {
        this.$notification['warning']({
          message: 'プロンプト情報',
          description: msg,
        });
      },
    }

  }

</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>