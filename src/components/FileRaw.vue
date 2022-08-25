<script setup lang="tsx">
import { link } from 'fs';

interface Props {
  path: string[];
}
const props = defineProps<Props>();

let __path = reactive(props.path)
let _path = "", path: string
for (const x of __path) {
  _path += "/" + x;
}
path = _path || "/";

const DLink = "/api/raw?path=" + path
</script>
<template>
  <el-link :href="DLink">下载</el-link>
</template>
<style>
</style>