<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="タイトル">
              <a-input placeholder="タイトルを入力してください" v-model="queryParam.titile"></a-input>
            </a-form-item>
          </a-col>
          <!--<a-col :span="6">
            <a-form-item label="コンテンツ">
              <a-input placeholder="コンテンツを入力してください" v-model="queryParam.msgContent"></a-input>
            </a-form-item>
          </a-col>-->

          <a-col :span="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('システム通知')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
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
          <a  v-if="record.sendStatus == 0" @click="handleEdit(record)">編集</a>

          <a-divider type="vertical" v-if="record.sendStatus == 0"/>
          <a-dropdown>
            <a class="ant-dropdown-link">もっと <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.sendStatus != 1">
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.sendStatus == 0">
                <a-popconfirm title="公開を確認しますか？" @confirm="() => releaseData(record.id)">
                  <a>公開</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.sendStatus == 1">
                <a-popconfirm title="キャンセルを確認しますか？" @confirm="() => reovkeData(record.id)">
                  <a>キャンセル</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                  <a @click="handleDetail(record)">表示</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <sysAnnouncement-modal ref="modalForm" @ok="modalFormOk"></sysAnnouncement-modal>
  </a-card>
</template>

<script>
  import SysAnnouncementModal from './modules/SysAnnouncementModal'
  import {doReleaseData, doReovkeData} from '@/api/api'
  import {getAction} from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "SysAnnouncementList",
    mixins: [JeecgListMixin],
    components: {
      SysAnnouncementModal
    },
    data() {
      return {
        description: 'システム通知フォーム管理ページ',
        // クエリ条件
        queryParam: {},
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },

          {
            title: 'タイトル',
            align: "center",
            dataIndex: 'titile'
          },
          {
            title: 'メッセージタイプ',
            align: "center",
            dataIndex: 'msgCategory',
            customRender: function (text) {
              if (text == '1') {
                return "通知公告";
              } else if (text == "2") {
                return "システムメッセージ";
              } else {
                return text;
              }
            }
          },
          /*{
            title: '開始時間',
            align: "center",
            dataIndex: 'startTime'
          },
          {
            title: '終了時間',
            align: "center",
            dataIndex: 'endTime'
          },*/
          {
            title: '公開者',
            align: "center",
            dataIndex: 'sender'
          },
          {
            title: '優先度',
            align: "center",
            dataIndex: 'priority',
            customRender: function (text) {
              if (text == 'L') {
                return "低";
              } else if (text == "M") {
                return "中";
              } else if (text == "H") {
                return "高";
              } else {
                return text;
              }
            }
          },
          {
            title: '通知対象',
            align: "center",
            dataIndex: 'msgType',
            customRender: function (text) {
              if (text == 'USER') {
                return "指定ユーザー";
              } else if (text == "ALL") {
                return "すべてのユーザー";
              } else {
                return text;
              }
            }
          },
          {
            title: '公開ステータス',
            align: "center",
            dataIndex: 'sendStatus',
            customRender: function (text) {
              if (text == 0) {
                return "未公開";
              } else if (text == 1) {
                return "公開";
              } else if (text == 2) {
                return "キャンセルしました";
              } else {
                return text;
              }
            }
          },
          {
            title: '公開时间',
            align: "center",
            dataIndex: 'sendTime'
          },
          {
            title: 'キャンセル时间',
            align: "center",
            dataIndex: 'cancelTime'
          },
          /*{
                title: '削除ステータス（0、通常、1削除）',
                align:"center",
                dataIndex: 'delFlag'
              },*/
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
          }
        ],
        url: {
          list: "/sys/annountCement/list",
          delete: "/sys/annountCement/delete",
          deleteBatch: "/sys/annountCement/deleteBatch",
          releaseDataUrl: "/sys/annountCement/doReleaseData",
          reovkeDataUrl: "sys/annountCement/doReovkeData",
          exportXlsUrl: "sys/annountCement/exportXls",
          importExcelUrl: "sys/annountCement/importExcel",
        },
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      //公開操作を実行する
      releaseData: function (id) {
        console.log(id);
        var that = this;
        doReleaseData({id: id}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData(1);
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      //キャンセル操作を実行します
      reovkeData: function (id) {
        var that = this;
        doReovkeData({id: id}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData(1);
            this.syncHeadNotic(id)
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      syncHeadNotic(anntId){
        getAction("sys/annountCement/syncNotic",{anntId:anntId})
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>