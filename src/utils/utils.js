export function createChess() {
  let count = 0
  let res = '{'
  for (let a = 0; a < 4; a++) {
    let s1 = String.fromCharCode(97 + a)
    for (let j = 0; j < 4; j++) {
      if (j == 3 && a == 3) {
        continue
      }
      let s2 = s1 + String.fromCharCode(97 + j)
      for (let k = 0; k < 4; k++) {
        let ch3 = 'd'
        if (a == 3 || j == 3) {
          if (k == 3) {
            continue
          }
          ch3 = String.fromCharCode(97 + k)
        }
        let s3 = s2 + ch3
        for (let d = 0; d < 3; d++) {
          let s4 = s3 + String.fromCharCode(97 + d)
          for (let e = 0; e < 3; e++) {
            let s5 = s4 + String.fromCharCode(97 + e)
            if (res.indexOf(s5) == -1) {
              res += '"'
              res += s5
              console.log(++count, s5)
              res += '":1,'
            }
          }
        }
      }
    }
  }
  res = res.slice(0, -1)
  res += '}'
  console.log(res)
  let resJson = JSON.parse(res)
  console.log(resJson)
}
