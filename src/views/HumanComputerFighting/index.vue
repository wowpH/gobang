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
        <q-btn color="primary" label="开始" :disable="playing" @click="begin" />
        <q-btn
          color="secondary"
          label="结束"
          :disable="!playing"
          @click="end"
        />
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
      // 对局信息
      history: [], // 历史记录
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
  computed: {
    cursorLeft() {
      return (
        constant.boardPadding +
        (this.cellWidth + constant.boardLineWidth) * this.cursorX -
        this.cellWidth / 2 +
        'px'
      )
    },
    cursorTop() {
      return (
        constant.boardPadding +
        (this.cellWidth + constant.boardLineWidth) * this.cursorY -
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
              constant.boardPadding * 2 -
              constant.boardLineWidth * 15) /
            14
          this.chessRadius = this.cellWidth / 2
          this.cursorSize = this.cellWidth + 'px'
          this.showBoard = true
          // 不加延时，棋盘有可能无法绘制出来
          setTimeout(() => {
            this.drawChessboard()
            this.drawChesses()
          }, 10)
        }
      })
      resizeObserver.observe(this.$refs.canvasBox)
    },
    drawChesses() {
      if (this.history) {
        this.history.forEach((chess) => {
          this.drawChess(chess)
        })
      }
    },
    /**
     * 绘制棋盘
     */
    drawChessboard() {
      if (this.$refs.chessboard.getContext) {
        const context = this.$refs.chessboard.getContext('2d')
        const start = constant.boardPadding
        const end = board.padding + (this.cellWidth + board.lineWidth) * 14
        context.lineWidth = board.lineWidth
        context.beginPath()
        for (let i = 0; i < 15; i++) {
          const lineLength =
            board.padding + (this.cellWidth + board.lineWidth) * i
          // 行
          context.moveTo(start, lineLength)
          context.lineTo(end, lineLength)
          // 列
          context.moveTo(lineLength, start)
          context.lineTo(lineLength, end)
        }
        context.closePath()
        context.stroke()
      }
    },
    /**
     * 绘制棋子
     * @param chess 棋子信息(列x,行y,玩家player)
     */
    drawChess(chess) {
      if (this.$refs.chesses.getContext) {
        let context = this.$refs.chesses.getContext('2d')
        context.beginPath()
        context.arc(
          constant.boardPadding +
            (this.cellWidth + constant.boardLineWidth) * chess.x,
          constant.boardPadding +
            (this.cellWidth + constant.boardLineWidth) * chess.y,
          this.chessRadius,
          0,
          Math.PI * 2,
        )
        // console.log(`player.A:${player.A}`)
        context.fillStyle = chess.player === player.A ? 'black' : 'white'
        context.fill()
      }
    },
    // 落子事件
    handleClick() {
      let x = this.cursorX
      let y = this.cursorY
      clearTimeout(this.timer)
      let row = this.boardState[y]
      if (row[x]) {
        this.tip = '这里有棋子啦，请换个地方吧！'
        this.timer = setTimeout(() => {
          this.tip = ''
        }, 2000)
        return
      } else {
        this.tip = ''
      }
      let chess = { x: x, y: y, player: this.player }
      this.history.push(chess)
      row[x] = this.player
      this.drawChess(chess)
      this.checkRow(chess)
      this.checkCol(chess)
      this.checkSlash(chess)
      this.checkBackSlash(chess)
      this.changePlayer()
    },
    /**
     * 改变落子玩家
     */
    changePlayer() {
      this.player = this.player === player.A ? player.B : player.A
    },
    checkRow(chess) {
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
    // 点击开始
    begin() {
      this.playing = true
      this.chessboard = []
      this.player = '1'
      this.resetBoardRecord()
      this.winner = ''
      this.$refs.chesses
        .getContext('2d')
        .clearRect(0, 0, this.$refs.chesses.width, this.$refs.chesses.height)
      this.$refs.chesses.addEventListener('click', this.handleClick)
      // 监听鼠标移动
      this.$refs.boardBox.addEventListener('mousemove', this.handleMouseMove)
      this.cursorX = this.cursorY = 7
      this.setCursorInterval()
    },
    /**
     * 重置棋盘落子记录
     */
    resetBoardRecord() {
      this.boardState = []
      let row = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      for (let i = 0; i < 15; i++) {
        this.boardState[i] = [...row]
      }
      // console.log(this.boardState)
      // console.log('棋盘落子记录重置完成')
    },
    gameOver() {
      this.playing = false
      this.winner = this.player
      this.winWord = `恭喜${this.winner === '1' ? '黑棋' : '白棋'}获胜`
      this.$refs.chesses.removeEventListener('click', this.handleClick)
    },
    end() {
      this.playing = false
      this.$refs.chesses.removeEventListener('click', this.handleClick)
      this.$refs.boardBox.removeEventListener('mousemove', this.handleMouseMove)
    },
    handleMouseMove: _.throttle(
      function (event) {
        // console.log(`光标位置:(${event.offsetX}, ${event.offsetY})`)
        // console.log(`棋盘宽度: ${this.boardWidth}`)
        // console.log(`棋盘格子宽度: ${this.cellWidth}`)
        const x = event.offsetX
        const y = event.offsetY
        // console.log(`x: ${x}`)
        // console.log(`y: ${y}`)
        const boardLeft = constant.boardPadding - this.cellWidth / 2 - 1
        // console.log(`boardLeft: ${boardLeft}`)
        const boardRight =
          this.boardWidth - (constant.boardPadding - this.cellWidth / 3)
        // console.log(`boardRight: ${boardRight}`)
        if (
          x < boardLeft ||
          x > boardRight ||
          y < boardLeft ||
          y > boardRight
        ) {
          return
        }
        const mod = this.cellWidth + constant.boardLineWidth
        // console.log(`mod: ${mod}`)
        const tempX = parseInt((x - boardLeft) / mod)
        const tempY = parseInt((y - boardLeft) / mod)
        if (tempX >= 0 && tempX <= 14) {
          this.cursorX = tempX
        }
        if (tempY >= 0 && tempY <= 14) {
          this.cursorY = tempY
        }
        // console.log(`光标X: ${this.cursorX}`)
        // console.log(`光标Y: ${this.cursorY}`)
      },
      10,
      { leading: true },
    ),
    drawCursor() {},
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
