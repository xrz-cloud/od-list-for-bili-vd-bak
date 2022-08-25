/**
 * 由扩展名识别文件类型
 * @param extension 文件扩展名
 * @returns {*}
 */
export function getFileType(extension: string) {
  if (['mp4', 'mkv', 'flv', 'webm', 'avi', 'mov', 'wmv'].includes(extension)) {
    return 'video'
  }
  if (['gif', 'jpeg', 'jpg', 'png', 'svg', 'webp', 'jfif', 'ico', 'bmp', 'avif'].includes(extension)) {
    return 'image'
  }
  if (['flac', 'mp3', 'wav', 'm4a'].includes(extension)) {
    return 'audio'
  }
  if (['7z', 'rar', 'bz2', 'xz', 'tar', 'tgz', 'gz', 'zip', 'iso', 'apk', 'ipa', 'exe', 'msi', 'bin'].includes(extension)) {
    return 'archive'
  }
  if (['js', 'sh', 'php', 'py', 'css', 'html', 'xml', 'ts', 'json', 'yaml', 'yml', 'toml', 'ini', 'conf', 'bat'].includes(extension)) {
    return 'code'
  }
  if (['txt', 'csv', 'log', 'srt', 'ass', 'ssa', 'vtt'].includes(extension)) {
    return 'text'
  }
  if (['md', 'markdown'].includes(extension)) {
    return 'md'
  }
  if (['pdf'].includes(extension)) {
    return 'pdf'
  }
  if (['ppt', 'pptx'].includes(extension)) {
    return 'powerpoint'
  }
  if (['doc', 'docx'].includes(extension)) {
    return 'word'
  }
  if (['xls', 'xlsx'].includes(extension)) {
    return 'excel'
  }
  return ''
}

/**
 * 从文件名中提取扩展名
 * @param filename 文件名
 * @returns {*}
 */
export function getExtension(filename: string): string {
  return (filename.split('.').pop() || 'null').toLowerCase()
}