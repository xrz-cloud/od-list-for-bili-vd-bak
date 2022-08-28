<script setup lang="tsx">
import { ref, reactive, watch } from "vue";
import { ElLink, ElTag, TableV2FixedDir, TableV2SortOrder } from "element-plus";
import type { Column, SortBy, SortState } from "element-plus";
import yaml from "js-yaml";
import formatSize from "../utils/formatSize";
import isJSON from "../utils/isJSON";
import router from "../router";
import { useRoute } from "vue-router";
import console from "console";

interface group_main_config {
  bangumi:
  | {
    [key: symbol | string]: [number, string, string][] | [];
  }
  | {};
  rule?: [number, string, string][] | [];
}

interface group_bangumi_config {
  type: "mdid";
  name: string;
  BelongTo: string;
  own: object[];
}

type ODItem = {
  lastModifiedDateTime: string;
  name: string;
  size: number;
  file?: {
    mimeType: string;
  };
}[];
type ShowItem = {
  lastModifiedDateTime: string;
  name: string;
  size: number;
  link: {
    type: "file" | "folder" | "example";
    to: string;
  };
  file?: {
    mimeType: string;
  };
  ep?: number;
}[];

interface Props {
  path: string[];
}
const props = defineProps<Props>();

let __path = reactive(props.path);

const route = useRoute();
watch(
  //FIXME 跳转至 /raw/ 下目录时此页面再次进行一次请求
  () => route.params.path,
  (toParams, fromParams) => {
    if (toParams !== fromParams) {
      __path = toParams as string[];
      data.value = [
        {
          lastModifiedDateTime: new Date().toLocaleString(),
          name: "加载中",
          size: -1,
          link: {
            type: "example",
            to: "",
          },
        },
        {
          lastModifiedDateTime: new Date().toLocaleString(),
          name: "Loading",
          size: -1,
          link: {
            type: "example",
            to: "",
          },
        },
      ];
      MakePath();
      main();
    }
  }
);

let _path = "",
  path: string;
function MakePath() {
  _path = "";
  for (const x of __path) {
    _path += "/" + x;
  }
  path = _path || "/";
}
MakePath();

const columns: Column<any>[] = [
  {
    key: "type",
    title: "类型",
    dataKey: "link",
    width: 70,
    sortable: true,
    fixed: TableV2FixedDir.LEFT,
    cellRenderer: ({ cellData: link }) => <p>{link.type}</p>,
  },
  {
    key: "name",
    title: "文件(夹)名",
    dataKey: "name",
    width: 300,
    sortable: true,
    fixed: TableV2FixedDir.LEFT,
    cellRenderer: ({ cellData: name }) => (
      <p style="padding: 10px 0;">{name}</p>
    ),
  },
  {
    key: "lastModifiedDateTime",
    title: "最后一次更改日期",
    dataKey: "lastModifiedDateTime",
    width: 150,
    align: "center",
    cellRenderer: ({ cellData: lastModifiedDateTime }) => (
      <ElTag>{lastModifiedDateTime}</ElTag>
    ),
  },
  {
    key: "size",
    title: "大小",
    dataKey: "size",
    width: 150,
    align: "center",
    cellRenderer: ({ cellData: size }) => <ElTag>{formatSize(size)}</ElTag>,
  },
  {
    key: "operations",
    title: "操作",
    dataKey: "link",
    width: 150,
    align: "right",
    cellRenderer: ({ cellData: link }) => (
      <>
        <ElLink
          type="primary"
          onClick={() => {
            OpenFolderOrFile({ type: link.type, to: link.to });
          }}
        >
          打开
        </ElLink>
      </>
    ),
  },
];
const data = ref<ShowItem>([
  {
    lastModifiedDateTime: new Date().toLocaleString(),
    name: "加载中",
    size: -1,
    link: {
      type: "example",
      to: "",
    },
  },
  {
    lastModifiedDateTime: new Date().toLocaleString(),
    name: "Loading",
    size: -1,
    link: {
      type: "example",
      to: "",
    },
  },
]);

async function main() {
  fetch("/api/item?path=" + encodeURIComponent(path))
    .then((res) => {
      if (res.ok) return res.json();
      else return Promise.reject("返回数据出错");
    })
    .then((list_res: { value?: ODItem; error?: object }) => {
      /*if (list_res["value"] && path == "/group/") {
        let _list: ODItem = []; //一次过滤用
        //过滤文件夹
        for (const x of list_res.value) {
          //判断string是否为数字 '100'-->true 'abc'-->false
          if (!!Number(x.name) || x.file) {
            _list.push(x);
          }
        }
        return _list;
      } else */if (list_res.value) return list_res.value;
      else return Promise.reject("返回数据出错");
    })
    .then((_list) => {
      if (path == "/") {
        //通用list处理部分
        let __list: ShowItem = [];
        for (const x of _list) {
          __list.push({
            lastModifiedDateTime: new Date(
              x.lastModifiedDateTime
            ).toLocaleString(),
            name: x.name,
            size: x.size,
            link: {
              type: x.file ? "file" : "folder", //是否为file
              to: x.file ? "/raw" + path + x.name : path + x.name + "/",
            },
          });
        }
        data.value = __list;
        //TODO 加入README.md解析
      } else if (path == "/group/") {
        fetch("/api/raw?path=" + encodeURIComponent(path + "config.yaml"))
          .then((res) => {
            if (res.ok) return res.text();
            else return Promise.reject("返回数据出错");
          })
          .then(
            (main_config_res) => yaml.load(main_config_res) as group_main_config
          )
          .then((main_config) => {
            /*
             * @xrz-cloud 将name由mdid(media id)替换为对应的番剧名
             */
            let __list: ShowItem = []; //替换name用
            let blacklist: string[] = []
            for (const x of _list) {
              for (const [uuid, allSession] of Object.entries(
                main_config.bangumi
              )) {
                for (const j of allSession) {
                  if (Number(x.name) == j[0]) {
                    __list.push({
                      lastModifiedDateTime: new Date(
                        x.lastModifiedDateTime
                      ).toLocaleString(),
                      name: j[2],
                      size: x.size,
                      link: {
                        type: "folder",
                        to: path + x.name + "/",
                      },
                    });
                  }
                }
              }
              if (x.file) {
                /*
                 * @xrz-cloud 将文件添加
                 */
                __list.push({
                  lastModifiedDateTime: new Date(
                    x.lastModifiedDateTime
                  ).toLocaleString(),
                  name: x.name,
                  size: x.size,
                  link: {
                    type: "file",
                    to: "/raw" + path + x.name,
                  },
                });
              } else if (!Number(x.name)) {
                __list.push({
                  lastModifiedDateTime: new Date(
                    x.lastModifiedDateTime
                  ).toLocaleString(),
                  name: x.name,
                  size: x.size,
                  link: {
                    type: "folder",
                    to: path + x.name + "/",
                  },
                });
              }
            }
            return __list;
          })
          .then((__list) => {
            data.value = __list.sort((a, b) =>
              a.link.type < b.link.type ? 1 : -1
            ); //XXX folder优先于file
            //TODO 未实现按字符排序，仅folder>file
          })
        //BUG
        //.catch((err) => console.warn(err));
      } else if (path == "/single/") {
      } else if (props.path[0] == "group") {
        //通用list处理部分
        let __list: ShowItem = [];
        for (const x of _list) {
          __list.push({
            lastModifiedDateTime: new Date(
              x.lastModifiedDateTime
            ).toLocaleString(),
            name: x.name,
            size: x.size,
            link: {
              type: x.file ? "file" : "folder", //是否为file
              to: x.file ? "/raw" + path + x.name : path + x.name + "/",
            },
          });
        }
        fetch("/api/raw?path=" + encodeURIComponent(path + "config.yaml"))
          .then((res) => {
            if (res.ok) return res.text();
            else return Promise.reject("返回数据出错");
          })
          .then((res) => {
            if (isJSON(res)) return ["def", JSON.parse(res)]; //以默认模式运行
            else return ["conf", yaml.load(res) as group_bangumi_config]; //以config模式运行
          })
          .then((res) => {
            if (res[0] == "def" && res[1].error) data.value = __list;
            else if (res[0] == "conf") {
              let ___list: ShowItem = [];
              for (const j of __list) {
                if (res[1]['own'][0]["Bili"][0]["CML"][0]["video"][0][0] != -1)
                  for (const x of res[1]['own'][0]["Bili"][0]["CML"][0]["video"]) {
                    if (j.name == x[1])
                      ___list.push({
                        lastModifiedDateTime: j.lastModifiedDateTime,
                        name: "<video>  <" + x[0] + ">  " + j.name,
                        size: j.size,
                        link: j.link,
                      });
                  }
                if (res[1]['own'][0]["Bili"][0]["CML"][1]["danmaku"][0][0] != -1)
                  for (const x of res[1]['own'][0]["Bili"][0]["CML"][1]["danmaku"]) {
                    if (j.name == x[1])
                      ___list.push({
                        lastModifiedDateTime: j.lastModifiedDateTime,
                        name: "<danmaku>  <" + x[0] + ">  " + j.name,
                        size: j.size,
                        link: j.link,
                      });
                  }
                if (res[1]['own'][0]["Bili"][0]["CML"][2]["zip"][0][0] != -1)
                  for (const x of res[1]['own'][0]["Bili"][0]["CML"][2]["zip"]) {
                    if (j.name == x[1])
                      ___list.push({
                        lastModifiedDateTime: j.lastModifiedDateTime,
                        name: "<zip>  <" + x[0] + ">  " + j.name,
                        size: j.size,
                        link: j.link,
                      });
                  }
              }
              data.value = ___list
            }
          })
        //BUG
        //.catch((err) => console.warn(err));
      }
    })
  //BUG
  //.catch((err) => console.warn(err));
}
main();
/*
const sort = ref<SortBy>({ key: "name", order: TableV2SortOrder.ASC });
const onColumnSort = (sortBy: SortBy) => {
  const key = sortBy.key as keyof {
    lastModifiedDateTime: string;
    name: string;
    size: number;
  };
  const order = sortBy.order === "asc" ? 1 : -1;
  const dataClone = [...data.value];
  dataClone.sort((a, b) => (a[key] > b[key] ? order : -order));
  sort.value = sortBy;
  data.value = dataClone;
};
*/

const OpenFolderOrFile = (
  link:
    | {
      type: "file" | "folder" | "example";
      to: string;
    }
    | any //FIXME any类型
) => {
  if (link.type == "file") router.push(link.to);
  else if (link.type == "folder") router.push(link.to);
  else return; //XXX 此处可加特殊提示
};
</script>

<template>
  <el-table-v2 :columns="columns" :data="data" :estimated-row-height="70" :width="1000" :height="400" fixed />
</template>

<style>
</style>
