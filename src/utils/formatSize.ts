/**
 * 文件大小转换/单位换算
 * @param s size 文件大小（转换，必填）
 * @returns {*}
 */
export default function formatSize(s = 0): string {
  return s < 1024
    ? s + ' B'
    : s < Math.pow(1024, 2)
      ? Number(s / Math.pow(1024, 1)).toFixed(1) + ' KiB'
      : s < Math.pow(1024, 3)
        ? Number(s / Math.pow(1024, 2)).toFixed(1) + ' MiB'
        : s < Math.pow(1024, 4)
          ? Number(s / Math.pow(1024, 3)).toFixed(1) + ' GiB'
          : s < Math.pow(1024, 5)
            ? Number(s / Math.pow(1024, 4)).toFixed(1) + ' TiB'
            : '> 1PiB'
}