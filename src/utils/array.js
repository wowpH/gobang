/**
 * 创建一个二维数组
 * @param {Number} len 数组长度，默认值15
 * @param {*} fill 填充字符，默认值''
 */
const createArray = (len = 15, fill = '') => {
  const array = []
  for (let i = 0; i < len; i++) {
    const element = []
    for (let j = 0; j < len; j++) {
      element[j] = fill
    }
    array[i] = element
  }
  return array
}

export default { createArray }
