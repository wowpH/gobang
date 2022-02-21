<template>
  <div class="gobang q-pa-md relative-position bg-grey-2">
    <div ref="canvasBox" class="fit row justify-center">
      <div
        ref="boardBox"
        class="board"
        :style="{ width: boardWidth + 'px', height: boardWidth + 'px' }"
      >
        <!-- 棋盘 -->
        <canvas
          ref="chessboard"
          :width="boardWidth"
          :height="boardWidth"
          v-if="showBoard"
        ></canvas>
        <q-icon
          name="center_focus_strong"
          class="cursor"
          :size="cursorSize"
          :style="{ left: cursorLeft, top: cursorTop }"
          v-show="isShowCursor"
        />
        <!-- 棋子 -->
        <canvas
          ref="chesses"
          :width="boardWidth"
          :height="boardWidth"
          v-if="showBoard"
        ></canvas>
        <div v-if="!showBoard">屏幕太小了，换个大点的屏幕吧！</div>
        <div class="game-over" v-if="winner !== ''">{{ winWord }}</div>
      </div>
    </div>
    <div
      class="control-panel q-ma-md absolute-right column items-center q-gutter-y-md"
    >
      <div class="control column items-center q-gutter-y-md">
        <div class="column q-gutter-y-sm">
          <q-radio
            v-model="firstPlayer"
            val="1"
            label="我先手"
            :disable="playing"
          />
          <q-radio
            v-model="firstPlayer"
            val="2"
            label="电脑先手"
            :disable="playing"
          />
        </div>
        <q-btn color="primary" label="开始" :disable="playing" @click="begin" />
        <q-btn
          color="secondary"
          label="结束"
          :disable="!playing"
          @click="end"
        />
        <div>电脑自动落子:</div>
        <q-toggle
          v-model="computerAutomaticSwitch"
          color="green"
          :disable="playing"
        />
        <q-btn
          color="secondary"
          label="电脑落子"
          :disable="!playing"
          @click="handleComputerMoveChess"
        />
      </div>
      <div class="player">
        {{ player === '1' ? '轮到黑棋落子！' : '轮到白棋落子！' }}
      </div>
      <div class="tip">{{ tip }}</div>
    </div>
  </div>
</template>

<script>
import constant from '@/utils/constant.js'
import { board, player, cursor } from '@/utils/constant.js'
import _ from 'lodash'
import history from '@/utils/history.js'
import MoveChess from '@/utils/moveChess'
import drawChess from '@/mixins/drawChess.js'
import weight from '@/mixins/weight'
import array from '@/utils/array'
export default {
  name: 'EveryoneAgainst',
  data() {
    return {
      // 棋盘信息
      boardWidth: 0, // 棋盘宽度
      cellWidth: 0, // 格子宽度
      chessRadius: 0, // 棋子半径
      showBoard: false, // 是否显示棋盘
      // 玩家信息
      firstPlayer: player.A, // 先手玩家
      player: player.A, // '1'黑棋 '2'白棋
      computerAutomaticSwitch: false,
      // 对局信息
      boardState: [], // 棋盘状态
      playing: false, // 游戏中
      tip: '', // 提示
      timer: -1, // 定时器
      // 光标信息
      cursorSize: '40px', // 光标尺寸
      cursorX: 7, // 光标位置，从左至右
      cursorY: 7, // 光标位置，从上至下
      showCursor: false, // 显示光标
      cursorTimer: -1, // 光标定时器
      // 结束信息
      winner: '', // 获胜者
      winWord: '', // 获胜话术
    }
  },
  mixins: [drawChess, weight],
  computed: {
    cursorLeft() {
      return (
        board.padding +
        (this.cellWidth + board.lineWidth) * this.cursorX -
        this.cellWidth / 2 +
        'px'
      )
    },
    cursorTop() {
      return (
        board.padding +
        (this.cellWidth + board.lineWidth) * this.cursorY -
        this.cellWidth / 2 +
        'px'
      )
    },
    isShowCursor() {
      return (
        this.playing &&
        this.showBoard &&
        this.player === this.firstPlayer &&
        this.showCursor
      )
    },
  },
  watch: {
    cursorX: {
      handler() {
        String.toString()
        this.setCursorInterval()
      },
    },
    cursorY: {
      handler() {
        this.setCursorInterval()
      },
    },
  },
  mounted() {
    this.resizeBoard()
  },
  methods: {
    /**
     * 页面数据初始化
     */
    initPageData() {},
    /**
     * 重绘棋盘，根据监听到的棋盘画布父元素宽高绘制
     */
    resizeBoard() {
      const resizeObserver = new ResizeObserver((entries) => {
        this.showBoard = false
        let contentRect = entries[0].contentRect
        let width = contentRect.width
        let height = contentRect.height
        let minWidth = parseInt(width < height ? width : height)
        if (minWidth >= board.minWidth) {
          this.boardWidth =
            minWidth <= board.maxWidth ? minWidth : board.maxWidth
          this.cellWidth =
            (this.boardWidth -
              board.padding * 2 -
              constant.boardLineWidth * 15) /
            14
          this.chessRadius = this.cellWidth / 2
          this.cursorSize = this.cellWidth + 'px'
          this.showBoard = true
          // 不加延时，棋盘有可能无法绘制出来
          setTimeout(() => {
            this.drawChessboard()
          }, 10)
          setTimeout(() => {
            this.drawChesses()
          }, 200)
        }
      })
      resizeObserver.observe(this.$refs.canvasBox)
    },
    /**
     * 绘制棋盘
     */
    drawChessboard() {
      const ctx = this.$refs.chessboard.getContext('2d')
      const start = board.padding
      const end = board.padding + (this.cellWidth + board.lineWidth) * 14
      ctx.lineWidth = board.lineWidth
      ctx.beginPath()
      for (let i = 0; i < 15; i++) {
        const offset = board.padding + (this.cellWidth + board.lineWidth) * i
        // 行
        ctx.fillText(i + 1, 4, offset + 3)
        ctx.moveTo(start, offset)
        ctx.lineTo(end, offset)
        // 列
        ctx.fillText(i + 1, i < 9 ? offset - 3 : offset - 7, 14)
        ctx.moveTo(offset, start)
        ctx.lineTo(offset, end)
      }
      ctx.closePath()
      ctx.stroke()
    },
    /**
     * 绘制棋子历史记录
     */
    drawChesses() {
      if (history.get()) {
        history.forEach((chess) => {
          this.drawChess(chess)
        })
      }
    },
    /**
     * 开始事件
     */
    begin() {
      this.playing = true
      this.player = '1'
      this.winner = ''
      this.cursorX = this.cursorY = 7
      this.resetBoardRecord()
      history.clear()
      this.clearChessBoard()
      this.setCursorInterval()
      this.resetWeight()
      if (this.player === this.firstPlayer) {
        // 我行棋
        this.handleEventListener(true)
      } else {
        // 电脑行棋
        this.computerMoveChess()
      }
    },
    /**
     * 结束事件
     */
    end() {
      this.playing = false
      // history.clear()
      this.handleEventListener()
    },
    /**
     * 重置棋盘落子记录
     */
    resetBoardRecord() {
      this.boardState = array.createArray()
    },
    /**
     * 设置光标闪烁
     */
    setCursorInterval() {
      clearInterval(this.cursorTimer)
      this.showCursor = true
      this.cursorTimer = setInterval(() => {
        this.showCursor = !this.showCursor
      }, cursor.interval)
    },
    /**
     * 清空棋子画布
     */
    clearChessBoard() {
      let ctx = this.$refs.chesses.getContext('2d')
      let width = this.$refs.chesses.width
      let height = this.$refs.chesses.height
      ctx.clearRect(0, 0, width, height)
    },
    /**
     * 监听鼠标点击事件和移动事件
     * @param listen true启动监听, 默认false移除监听
     */
    handleEventListener(listen = false) {
      if (listen) {
        this.$refs.chesses.addEventListener('click', this.handleClick)
        this.$refs.boardBox.addEventListener('mousemove', this.handleMouseMove)
      } else {
        this.$refs.chesses.removeEventListener('click', this.handleClick)
        this.$refs.boardBox.removeEventListener(
          'mousemove',
          this.handleMouseMove,
        )
      }
    },
    /**
     * 落子事件
     */
    handleClick() {
      let moveChess = new MoveChess(this.cursorX, this.cursorY, this.player)
      // console.log('moveChess:', moveChess)
      this.checkExistingChess(moveChess)
    },
    /**
     * 光标移动事件
     */
    handleMouseMove: _.throttle(
      function (event) {
        const x = event.offsetX
        const y = event.offsetY
        const boardLeft = board.padding - this.cellWidth / 2 - 1
        const boardRight =
          this.boardWidth - (board.padding - this.cellWidth / 3)
        if (
          x < boardLeft ||
          x > boardRight ||
          y < boardLeft ||
          y > boardRight
        ) {
          return
        }
        const mod = this.cellWidth + constant.boardLineWidth
        const tempX = parseInt((x - boardLeft) / mod)
        const tempY = parseInt((y - boardLeft) / mod)
        if (tempX >= 0 && tempX <= 14) {
          this.cursorX = tempX
        }
        if (tempY >= 0 && tempY <= 14) {
          this.cursorY = tempY
        }
      },
      10,
      { leading: true },
    ),
    handleComputerMoveChess() {
      let pos = this.getPosition(this.player)
      let moveChess = new MoveChess(pos.x, pos.y, this.player)
      this.checkExistingChess(moveChess)
    },
    /**
     * 电脑着棋
     */
    computerMoveChess() {
      if (this.computerAutomaticSwitch) {
        let pos = this.getPosition(this.player)
        let moveChess = new MoveChess(pos.x, pos.y, this.player)
        this.checkExistingChess(moveChess)
      }
    },
    /**
     * 检查当前位置是否存在棋子
     */
    checkExistingChess(moveChess) {
      clearTimeout(this.timer)
      let row = this.boardState[moveChess.y]
      // console.log('moveChess.x:', moveChess.x)
      if (row[moveChess.x]) {
        this.tip = '这里有棋子啦，请换个地方吧！'
        this.timer = setTimeout(() => {
          this.tip = ''
        }, 2000)
      } else {
        this.tip = ''
        history.push(moveChess)
        row[moveChess.x] = moveChess.player
        this.drawChess(moveChess)
        this.checkGameOver(moveChess)
      }
    },
    /**
     * 检查是否终局
     */
    checkGameOver(moveChess) {
      let chess = { x: moveChess.x, y: moveChess.y, player: moveChess.player }
      this.checkRow(chess)
      if (this.winner) return
      this.checkCol(chess)
      if (this.winner) return
      this.checkSlash(chess)
      if (this.winner) return
      this.checkBackSlash(chess)
      if (this.winner) return
      this.updateWeight(moveChess)
      console.log('this.weightA:')
      console.table(this.weightA)
      console.log('this.weightB:')
      console.table(this.weightB)
      this.changePlayer()
    },
    /**
     * 改变落子玩家
     */
    changePlayer() {
      this.player = this.player === player.A ? player.B : player.A
      if (this.player === this.firstPlayer) {
        // 我行棋
        this.handleEventListener(true)
      } else {
        // 电脑行棋
        this.handleEventListener(false)
        this.computerMoveChess()
      }
    },
    checkRow(chess) {
      if (this.winner) return
      const { x, y, player } = chess
      let left = x - 1
      let right = x + 1
      let row = this.boardState[y]
      while (left >= 0 && row[left] === player) {
        left--
      }
      while (right <= 14 && row[right] === player) {
        right++
      }
      if (right - left > 5) {
        this.gameOver()
      }
    },
    checkCol(chess) {
      if (this.winner) return
      // console.log(chess)
      const { x, y, player } = chess
      // console.log(`(${x}, ${y}, ${player})`)
      let top = y - 1
      let bottom = y + 1
      // console.log(`top:${top}`)
      // console.log(`bottom:${bottom}`)
      while (top >= 0) {
        let row = this.boardState[top]
        if (row[x] !== player) {
          break
        }
        top--
      }
      while (bottom <= 14) {
        let row = this.boardState[bottom]
        if (row[x] !== player) {
          break
        }
        bottom++
      }
      if (bottom - top > 5) {
        this.gameOver()
      }
    },
    checkSlash(chess) {
      if (this.winner) return
      const { x, y, player } = chess
      let x1 = x + 1
      let y1 = y - 1
      while (x1 <= 14 && y1 >= 0) {
        let row = this.boardState[y1]
        if (row[x1] !== player) {
          break
        }
        x1++
        y1--
      }
      let x2 = x - 1
      let y2 = y + 1
      while (x2 >= 0 && y2 <= 14) {
        let row = this.boardState[y2]
        if (row[x2] !== player) {
          break
        }
        x2--
        y2++
      }
      if (x1 - x2 > 5) {
        this.gameOver()
      }
    },
    checkBackSlash(chess) {
      if (this.winner) return
      const { x, y, player } = chess
      let x1 = x - 1
      let y1 = y - 1
      while (x1 >= 0 && y1 >= 0) {
        let row = this.boardState[y1]
        if (row[x1] !== player) {
          break
        }
        x1--
        y1--
      }
      let x2 = x + 1
      let y2 = y + 1
      while (x2 <= 14 && y2 <= 14) {
        let row = this.boardState[y2]
        if (row[x2] !== player) {
          break
        }
        x2++
        y2++
      }
      if (x2 - x1 > 5) {
        this.gameOver()
      }
    },
    /**
     * 胜局
     */
    gameOver() {
      this.playing = false
      this.winner = this.player
      this.winWord = `恭喜${this.winner === '1' ? '黑棋' : '白棋'}获胜`
      this.handleEventListener()
    },
  },
}
</script>

<style lang="scss" scoped>
.gobang {
  height: calc(100vh - 50px);
  padding-right: 232px;
  .board {
    position: relative;
    background: #ffd75b;
    canvas {
      position: absolute;
      left: 0;
      top: 0;
    }
    .cursor {
      position: absolute;
    }
    .game-over {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.3);
      text-align: center;
      font-size: 70px;
      color: #ffffff;
    }
  }
  .control-panel {
    width: 200px;
    .control {
      display: flex;
      // flex-direction: column;
    }
  }
}
</style>
