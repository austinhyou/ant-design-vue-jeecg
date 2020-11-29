<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="アカウント">
              <!--<a-input placeholder="アカウントを入力してください" v-model="queryParam.username"></a-input>-->
              <j-input placeholder="アカウントファジークエリを入力してください" v-model="queryParam.username"></j-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="性別">
              <a-select v-model="queryParam.sex" placeholder="性別を選択してください">
                <a-select-option value="">選んでください</a-select-option>
                <a-select-option value="1">男性</a-select-option>
                <a-select-option value="2">女性</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="本名">
                <a-input placeholder="本名を入力してください" v-model="queryParam.realname"></a-input>
              </a-form-item>
            </a-col>

            <a-col :md="6" :sm="8">
              <a-form-item label="電話番号">
                <a-input placeholder="電話番号を入力してください" v-model="queryParam.phone"></a-input>
              </a-form-item>
            </a-col>

            <a-col :md="6" :sm="8">
              <a-form-item label="ユーザーステータス">
                <a-select v-model="queryParam.status" placeholder="選んでください">
                  <a-select-option value="">選んでください</a-select-option>
                  <a-select-option value="1">正常</a-select-option>
                  <a-select-option value="2">ロック</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">検索する</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '畳む' : '展開する' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">ユーザーを追加する</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('ユーザー情報')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-button type="primary" icon="hdd" @click="recycleBinVisible=true">ごみ箱</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay" @click="handleMenuClick">
          <a-menu-item key="1">
            <a-icon type="delete" @click="batchDel"/>
            削除
          </a-menu-item>
          <a-menu-item key="2">
            <a-icon type="lock" @click="batchFrozen('2')"/>
            ロック
          </a-menu-item>
          <a-menu-item key="3">
            <a-icon type="unlock" @click="batchFrozen('1')"/>
            ロック解除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          バッチ操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>選択された&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>項目&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
      </div>

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <template slot="avatarslot" slot-scope="text, record, index">
          <div class="anty-img-wrap">
            <a-avatar shape="square" :src="getAvatarView(record.avatar)" icon="user"/>
          </div>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)" >編集</a>

          <a-divider type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              もっと <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">詳細</a>
              </a-menu-item>

              <a-menu-item>
                <a href="javascript:;" @click="handleChangePassword(record.username)">パスワード</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status==1">
                <a-popconfirm title="ロックを確認しますか？" @confirm="() => handleFrozen(record.id,2,record.username)">
                  <a>ロック</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status==2">
                <a-popconfirm title="ロック解除を確認しますか？" @confirm="() => handleFrozen(record.id,1,record.username)">
                  <a>ロック解除</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item>
                <a href="javascript:;" @click="handleAgentSettings(record.username)">代理人</a>
              </a-menu-item>

            </a-menu>
          </a-dropdown>
        </span>


      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>

    <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal>

    <sys-user-agent-modal ref="sysUserAgentModal"></sys-user-agent-modal>

    <!-- ユーザーリサイクル -->
    <user-recycle-bin-modal :visible.sync="recycleBinVisible" @ok="modalFormOk"/>

  </a-card>
</template>

<script>
  import UserModal from './modules/UserModal'
  import PasswordModal from './modules/PasswordModal'
  import {putAction,getFileAccessHttpUrl} from '@/api/manage';
  import {frozenBatch} from '@/api/api'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import SysUserAgentModal from "./modules/SysUserAgentModal";
  import JInput from '@/components/jeecg/JInput'
  import UserRecycleBinModal from './modules/UserRecycleBinModal'

  export default {
    name: "UserList",
    mixins: [JeecgListMixin],
    components: {
      SysUserAgentModal,
      UserModal,
      PasswordModal,
      JInput,
      UserRecycleBinModal
    },
    data() {
      return {
        description: 'これはユーザー管理ページです',
        queryParam: {},
        recycleBinVisible: false,
        columns: [
          /*{
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },*/
          {
            title: 'ユーザーアカウント',
            align: "center",
            dataIndex: 'username',
            width: 120,
            sorter: true
          },
          {
            title: 'ユーザー名',
            align: "center",
            width: 100,
            dataIndex: 'realname',
          },
          {
            title: '顔写真',
            align: "center",
            width: 120,
            dataIndex: 'avatar',
            scopedSlots: {customRender: "avatarslot"}
          },

          {
            title: '性別',
            align: "center",
            width: 80,
            dataIndex: 'sex_dictText',
            sorter: true
          },
          {
            title: '誕生日',
            align: "center",
            width: 100,
            dataIndex: 'birthday'
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
            width: 180,
            dataIndex: 'orgCodeTxt'
          },
          {
            title: '状態',
            align: "center",
            width: 80,
            dataIndex: 'status_dictText'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 170
          }

        ],
        url: {
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/sys/user/list",
          delete: "/sys/user/delete",
          deleteBatch: "/sys/user/deleteBatch",
          exportXlsUrl: "/sys/user/exportXls",
          importExcelUrl: "sys/user/importExcel",
        },
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      getAvatarView: function (avatar) {
        return getFileAccessHttpUrl(avatar)
      },

      batchFrozen: function (status) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('レコードを選択してください');
          return false;
        } else {
          let ids = "";
          let that = this;
          let isAdmin = false;
          that.selectionRows.forEach(function (row) {
            if (row.username == 'admin') {
              isAdmin = true;
            }
          });
          if (isAdmin) {
            that.$message.warning('管理者アカウントではこの操作は許可されていません。もう一度選択してください');
            return;
          }
          that.selectedRowKeys.forEach(function (val) {
            ids += val + ",";
          });
          that.$confirm({
            title: "操作確認",
            content: "選択したアカウントを" + (status == 1 ? "ロック解除" : "ロック") + "しますか？",
            onOk: function () {
              frozenBatch({ids: ids, status: status}).then((res) => {
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
      handleMenuClick(e) {
        if (e.key == 1) {
          this.batchDel();
        } else if (e.key == 2) {
          this.batchFrozen(2);
        } else if (e.key == 3) {
          this.batchFrozen(1);
        }
      },
      handleFrozen: function (id, status, username) {
        let that = this;
        //TODO バックグラウンド検証管理者の役割
        if ('admin' == username) {
          that.$message.warning('管理者アカウントはこの操作を許可していません');
          return;
        }
        frozenBatch({ids: id, status: status}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleChangePassword(username) {
        this.$refs.passwordmodal.show(username);
      },
      handleAgentSettings(username){
        this.$refs.sysUserAgentModal.agentSettings(username);
        this.$refs.sysUserAgentModal.title = "ユーザー代理人の設定";
      },
      passwordModalOk() {
        //TODO パスワードの変更が完了しました。ページを更新する必要はありません。データソースのデータを更新できます。
      }
    }

  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>