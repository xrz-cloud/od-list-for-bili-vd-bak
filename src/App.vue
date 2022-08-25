<script setup lang="ts">
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { RouterLink, RouterView } from "vue-router";
import type { ButtonType } from "element-plus";

const size: ButtonType = "default";
const zIndex: number = 3000;
const locale = zhCn;
</script>

<template>
  <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
    <el-container>
      <el-header><TopMenu /></el-header>
      <el-main>
        <RouterView />
      </el-main>
      <el-footer>
        <el-row justify="center">Make by xrz.</el-row>
      </el-footer>
    </el-container>
  </el-config-provider>
</template>

<style></style>
