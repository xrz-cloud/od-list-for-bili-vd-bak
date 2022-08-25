/** 
 * 判断string是否为JSON
 * @param str 待判断的字符串
 * @returns {*}
 */

// 使用try-catch去捕捉错误
// 直接使用JSON.parse去转译，并把转译结果判断一下是不是object类型，如果是的话就返回true,否则就返回false,这样就排除了转化后非object的类型，比如"123456789"
export default function isJSON(str: string): boolean {
  try {
    if (typeof JSON.parse(str) == "object") {
      return true;
    }
  } catch (e) {
  }
  return false;
}