import array from '@/utils/array'
import { cursor, player as constPlayer } from '@/utils/constant'
import MoveChess from '@/utils/moveChess'

const weight = {
  data() {
    return {
      weightA: [], // 黑方权重
      weightB: [], // 白方权重
      weightTableJson: require('@/json/weight.json'), // 权重表
      calculating: 0, // 权重计算中
      endCalculate: 9, // 计算结束标识
    }
  },
  watch: {},
  mounted() {
    this.resetWeight()
  },
  methods: {
    resetWeight() {
      // console.clear()
      this.weightA = array.createArray(15, 0)
      this.weightB = array.createArray(15, 0)
      this.updateAllWeight(this.weightA)
      console.log('resetWeight() -> this.weightA:')
      console.table(this.weightA)
      this.updateAllWeight(this.weightB)
      console.log('resetWeight() -> this.weightB:')
      console.table(this.weightB)
    },
    updateAllWeight(weightArr) {
      // console.log('this.weightA:', this.weightA)
      // console.log('weightArr:', weightArr)
      for (let y = 0; y < weightArr.length; y++) {
        // console.log('y:', y)
        const row = weightArr[y]
        for (let x = 0; x < row.length; x++) {
          // console.log('x:', x)
          const pos = row[x]
          // console.log('pos:', pos)
          // 行
          let x1 = x >= 4 ? x - 4 : 0
          let x2 = x <= 10 ? x + 4 : 14
          let str = ''
          for (let i = x1; i <= x2; i++) {
            str += i === x ? 'd' : 'c'
          }
          for (let i = 0; i < str.length - 4; i++) {
            const five = str.substring(i, i + 5)
            let w = this.weightTableJson[five]
            if (!w) {
              const newFive = five.split('').reverse().join('')
              w = this.weightTableJson[newFive]
            }
            row[x] += w ? w : 0
          }
          // 列
          let y1 = y >= 4 ? y - 4 : 0
          let y2 = y <= 10 ? y + 4 : 14
          str = ''
          for (let i = y1; i <= y2; i++) {
            str += i === y ? 'd' : 'c'
          }
          for (let i = 0; i < str.length - 4; i++) {
            const five = str.substring(i, i + 5)
            let w = this.weightTableJson[five]
            if (!w) {
              const newFive = five.split('').reverse().join('')
              w = this.weightTableJson[newFive]
            }
            row[x] += w ? w : 0
          }
          // 正斜
          x1 = x + 4
          y1 = y - 4
          while (x1 > 14 || y1 < 0) {
            x1--
            y1++
          }
          x2 = x - 4
          y2 = y + 4
          while (x2 < 0 || y2 > 14) {
            x2++
            y2--
          }
          if (x1 - x2 >= 4) {
            str = ''
            for (let i = y1; i <= y2; i++) {
              str += i === y ? 'd' : 'c'
            }
            for (let i = 0; i < str.length - 4; i++) {
              const five = str.substring(i, i + 5)
              let w = this.weightTableJson[five]
              if (!w) {
                const newFive = five.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              row[x] += w ? w : 0
            }
          }
          // 正斜结束
          // 反斜
          x1 = x - 4
          y1 = y - 4
          while (x1 < 0 || y1 < 0) {
            x1++
            y1++
          }
          x2 = x + 4
          y2 = y + 4
          while (x2 > 14 || y2 > 14) {
            x2--
            y2--
          }
          if (x2 - x1 >= 4) {
            str = ''
            for (let i = y1; i <= y2; i++) {
              str += i === y ? 'd' : 'c'
            }
            for (let i = 0; i < str.length - 4; i++) {
              const five = str.substring(i, i + 5)
              let w = this.weightTableJson[five]
              if (!w) {
                const newFive = five.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              row[x] += w ? w : 0
            }
          }
          // 反斜结束
        }
      }
    },
    updateWeight(moveChess) {
      // console.clear()
      // console.log('updateWeight()')
      this.calculating++
      console.log('this.calculating:', this.calculating)
      if (moveChess.constructor === MoveChess) {
        this.updateWeightAfterMoveChess(moveChess)
      }
    },
    updateWeightAfterMoveChess(moveChess) {
      console.log('updateWeightAfterMoveChess()')
      this.updateWeightByMoveChess(moveChess, constPlayer.A, this.weightA)
      this.updateWeightByMoveChess(moveChess, constPlayer.B, this.weightB)
    },
    updateWeightByMoveChess(moveChess, me, weightArr) {
      console.log('updateWeightByMoveChess()')
      console.log('moveChess:', moveChess)
      console.log('me:', me)
      // console.log('weightArr:')
      // console.table(weightArr)
      this.updateWeightByMoveChessRow(moveChess, me, weightArr)
      this.updateWeightByMoveChessCol(moveChess, me, weightArr)
      this.updateWeightByMoveChessSlash(moveChess, me, weightArr)
      this.updateWeightByMoveChessBackSlash(moveChess, me, weightArr)
    },
    updateWeightByMoveChessRow(moveChess, me, weightArr) {
      // console.log('updateWeightByMoveChessRow()')
      let x1 = moveChess.x >= 4 ? moveChess.x - 4 : 0
      let x2 = moveChess.x <= 10 ? moveChess.x + 4 : 14
      const stateRow = this.boardState[moveChess.y]
      // 落子影响后的棋局
      let str = ''
      // 落子影响前的棋局
      let preRow = ''
      for (let i = x1; i <= x2; i++) {
        if (i === moveChess.x) {
          preRow += 'c'
        } else {
          preRow +=
            stateRow[i] === constPlayer.C ? 'c' : stateRow[i] === me ? 'a' : 'b'
        }
        str +=
          stateRow[i] === constPlayer.C ? 'c' : stateRow[i] === me ? 'a' : 'b'
      }
      // console.log('str:', str)
      const weightRow = weightArr[moveChess.y]
      if (str.indexOf('c') >= 0) {
        for (let i = 0; i < str.length - 4; i++) {
          let five = str.substring(i, i + 5)
          for (let j = 0; j < five.length; j++) {
            if (five.charAt(j) === 'c') {
              let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
              let w = this.weightTableJson[newFive]
              if (!w) {
                newFive = newFive.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              weightRow[x1 + i + j] += w ? w : 0
              // console.log('weightArr:')
              // console.table(weightArr)
            }
          }
        }
      } else {
        console.log('落子后，无空白位置可继续落子，不用计算权重')
      }
      // 减去落子前的权重
      for (let i = 0; i < preRow.length - 4; i++) {
        let five = preRow.substring(i, i + 5)
        for (let j = 0; j < five.length; j++) {
          if (five.charAt(j) === 'c') {
            let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
            let w = this.weightTableJson[newFive]
            if (!w) {
              newFive = newFive.split('').reverse().join('')
              w = this.weightTableJson[newFive]
            }
            weightRow[x1 + i + j] -= w ? w : 0
          }
        }
      }
      // console.log(me + ', weightArr:')
      // console.table(weightArr)
      this.calculating = (this.calculating + 1) % this.endCalculate
      console.log(
        'updateWeightByMoveChessRow() -> this.calculating:',
        this.calculating,
      )
    },
    updateWeightByMoveChessCol(moveChess, me, weightArr) {
      // console.log('updateWeightByMoveChessCol()')
      const y1 = moveChess.y >= 4 ? moveChess.y - 4 : 0
      const y2 = moveChess.y <= 10 ? moveChess.y + 4 : 14
      let str = ''
      let preStr = ''
      for (let y = y1; y <= y2; y++) {
        const stateRow = this.boardState[y]
        const chess = stateRow[moveChess.x]
        const append = chess === constPlayer.C ? 'c' : chess === me ? 'a' : 'b'
        str += append
        preStr += y === moveChess.y ? 'c' : append
      }
      if (str.indexOf('c') >= 0) {
        for (let i = 0; i < str.length - 4; i++) {
          const five = str.substring(i, i + 5)
          for (let j = 0; j < five.length; j++) {
            if (five.charAt(j) === 'c') {
              let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
              let w = this.weightTableJson[newFive]
              let weightRow = weightArr[y1 + i + j]
              if (!w) {
                newFive = newFive.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              weightRow[moveChess.x] += w ? w : 0
            }
          }
        }
      }
      for (let i = 0; i < preStr.length - 4; i++) {
        const five = preStr.substring(i, i + 5)
        for (let j = 0; j < five.length; j++) {
          if (five.charAt(j) === 'c') {
            let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
            let w = this.weightTableJson[newFive]
            if (!w) {
              newFive = newFive.split('').reverse().join('')
              w = this.weightTableJson[newFive]
            }
            const weightRow = weightArr[y1 + i + j]
            weightRow[moveChess.x] -= w ? w : 0
          }
        }
      }
      this.calculating = (this.calculating + 1) % this.endCalculate
      console.log(
        'updateWeightByMoveChessCol() -> this.calculating:',
        this.calculating,
      )
    },
    updateWeightByMoveChessSlash(moveChess, me, weightArr) {
      console.log('updateWeightByMoveChessSlash()')
      // 右上角
      let x1 = moveChess.x + 4
      let y1 = moveChess.y - 4
      while (x1 > 14 || y1 < 0) {
        x1--
        y1++
      }
      // 左下角
      let x2 = moveChess.x - 4
      let y2 = moveChess.y + 4
      while (x2 < 0 || y2 > 14) {
        x2++
        y2--
      }
      if (x1 - x2 >= 4) {
        let slash = ''
        let preStr = ''
        for (let y = y1; y <= y2; y++) {
          const stateRow = this.boardState[y]
          const chess = stateRow[x1 - (y - y1)]
          const append =
            chess === constPlayer.C ? 'c' : chess === me ? 'a' : 'b'
          slash += append
          preStr += y === moveChess.y ? 'c' : append
        }
        if (slash.indexOf('c') >= 0) {
          for (let i = 0; i < slash.length - 4; i++) {
            const five = slash.substring(i, i + 5)
            for (let j = 0; j < five.length; j++) {
              if (five.charAt(j) === 'c') {
                let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
                let w = this.weightTableJson[newFive]
                if (!w) {
                  newFive = newFive.split('').reverse().join('')
                  w = this.weightTableJson[newFive]
                }
                const weightRow = weightArr[y1 + i + j]
                weightRow[x1 - i - j] += w ? w : 0
              }
            }
          }
        } else {
          console.log('落子后，无空白位置可继续落子，不用计算权重')
        }
        for (let i = 0; i < preStr.length - 4; i++) {
          const five = preStr.substring(i, i + 5)
          for (let j = 0; j < five.length; j++) {
            if (five.charAt(j) === 'c') {
              let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
              let w = this.weightTableJson[newFive]
              if (!w) {
                newFive = newFive.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              const weightRow = weightArr[y1 + i + j]
              weightRow[x1 - i - j] -= w ? w : 0
            }
          }
        }
      }
      this.calculating = (this.calculating + 1) % this.endCalculate
      console.log(
        'updateWeightByMoveChessSlash() -> calculating:',
        this.calculating,
      )
    },
    updateWeightByMoveChessBackSlash(moveChess, me, weightArr) {
      console.log(
        `updateWeightByMoveChessBackSlash(${JSON.stringify(moveChess)}, ${me})`,
      )
      console.log('weightArr:')
      console.table(weightArr)
      // 左上角
      let x1 = moveChess.x - 4
      let y1 = moveChess.y - 4
      while (x1 < 0 || y1 < 0) {
        x1++
        y1++
      }
      // 右下角
      let x2 = moveChess.x + 4
      let y2 = moveChess.y + 4
      while (x2 > 14 || y2 > 14) {
        x2--
        y2--
      }
      if (x2 - x1 >= 4) {
        let backSlash = ''
        let preBackSlash = ''
        for (let y = y1; y <= y2; y++) {
          const stateRow = this.boardState[y]
          const chess = stateRow[x1 + (y - y1)]
          const append =
            chess === constPlayer.C ? 'c' : chess === me ? 'a' : 'b'
          backSlash += y === moveChess.y ? 'c' : append
        }
        if (backSlash.indexOf('c') >= 0) {
          for (let i = 0; i < backSlash.length - 4; i++) {
            const five = backSlash.substring(i, i + 5)
            for (let j = 0; j < five.length; j++) {
              if (five.charAt(j) === 'c') {
                let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
                let w = this.weightTableJson[newFive]
                if (!w) {
                  newFive = newFive.split('').reverse().join('')
                  w = this.weightTableJson[newFive]
                }
                const weightRow = weightArr[y1 + i + j]
                weightRow[x1 + i + j] += w ? w : 0
                // console.table('weightArr:')
                // console.table(weightArr)
              }
            }
          }
        } else {
          console.log('落子后，无空白位置可继续落子，不用计算权重')
        }
        for (let i = 0; i < preBackSlash.length - 4; i++) {
          const five = preBackSlash.substring(i, i + 5)
          for (let j = 0; j < five.length; j++) {
            if (five.charAt(j) === 'c') {
              let newFive = five.substring(0, j) + 'd' + five.substring(j + 1)
              let w = this.weightTableJson[newFive]
              if (!w) {
                newFive = newFive.split('').reverse().join('')
                w = this.weightTableJson[newFive]
              }
              const weightRow = weightArr[y1 + i + j]
              weightRow[x1 + i + j] -= w ? w : 0
            }
          }
        }
      }
      this.calculating = (this.calculating + 1) % this.endCalculate
      console.log(
        'updateWeightByMoveChessBackSlash() -> this.calculating:',
        this.calculating,
      )
    },
    /**
     * 获取对于`player`的最佳落子位置
     * @param {String} player 行棋方, 1黑方, 2白方
     * @returns
     */
    getPosition(player) {
      console.log(`getPosition(${player})`)
      console.log('this.calculating:', this.calculating)
      // console.log('this.weightA:', this.weightA)
      // console.log('this.weightB:', this.weightB)
      if (this.calculating !== 0) {
        setTimeout(() => {
          if (this.calculating !== 0) {
            return this.getRandomPosition(player)
          } else {
            return this.findBestPosition(player)
          }
        }, 10000)
      } else {
        return this.findBestPosition(player)
      }
    },
    getRandomPosition(player) {
      // console.log('getRandomPosition()')
      let x = parseInt(Math.random() * 15)
      let y = parseInt(Math.random() * 15)
      let row = this.boardState[y]
      while (row[x]) {
        x = parseInt(Math.random() * 15)
        y = parseInt(Math.random() * 15)
        row = this.boardState[y]
        // console.log(`最佳位置:(${x}, ${y})`)
      }
      let pos = { x: x, y: y }
      // console.log('pos:')
      // console.log(pos)
      return pos
    },
    findBestPosition(player) {
      console.log(`findBestPosition(${player})`)
      let pos = this.getRandomPosition(player)
      // console.log('this.weightA:')
      // console.table(this.weightA)
      // console.log('this.weightB:')
      // console.table(this.weightB)
      let weightRow = this.weightA[pos.y]
      let maxWeight = weightRow[pos.x]
      // console.log('this.boardState:')
      // console.table(this.boardState)
      // console.log('maxWeight:', maxWeight)
      for (let i = 0; i < this.boardState.length; i++) {
        let rowState = this.boardState[i]
        for (let j = 0; j < rowState.length; j++) {
          if (rowState[j]) {
            continue
          }
          weightRow = this.weightA[i]
          if (weightRow[j] > maxWeight) {
            maxWeight = weightRow[j]
            pos.x = j
            pos.y = i
          }
          weightRow = this.weightB[i]
          if (weightRow[j] > maxWeight) {
            maxWeight = weightRow[j]
            pos.x = j
            pos.y = i
          }
        }
      }
      // console.log(`maxWeight: ${maxWeight}`)
      // console.log('最佳位置:', pos)
      return pos
    },
    resetWeightByMoveChess(moveChess) {
      const rowA = this.weightA[moveChess.y]
      rowA[moveChess.x] = 0
      const rowB = this.weightB[moveChess.y]
      rowB[moveChess.x] = 0
    },
  },
}

export default weight
