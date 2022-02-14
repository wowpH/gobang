<template>
  <div class="gobang">
    <div class="board">
      <canvas
        id="chessboard"
        ref="chessboard"
        :width="boardWidth"
        :height="boardWidth"
      ></canvas>
      <canvas
        id="chesses"
        ref="chesses"
        :width="boardWidth"
        :height="boardWidth"
      ></canvas>
      <div class="game-over" v-if="winner !== ''">
        {{ this.winner === '1' ? '恭喜黑棋获胜！' : '恭喜白棋获胜！' }}
      </div>
    </div>
    <div class="menu">
      <div class="mode">人人模式</div>
      <div class="control">
        <button @click="begin" :disabled="playing">开始</button>
        <!-- <button @click="begin" :disabled="!playing">重新开始</button> -->
        <button @click="end" :disabled="!playing">结束</button>
      </div>
      <div class="player">
        {{ player === '1' ? '轮到黑棋落子！' : '轮到白棋落子！' }}
      </div>
      <div class="tip">{{ tip }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  data() {
    return {
      cellWidth: 40, // 格子宽度
      lineWidth: 2, // 线宽度
      chessRadius: 18, // 棋子半径
      boardPadding: 20, // 棋盘内边距
      boardWidth: 630, // 棋盘宽度
      chessRecord: [], // 落子记录
      boardRecord: [], // 棋盘记录
      player: '1', // '1'黑棋 '2'白棋
      playing: false, // 游戏中
      tip: '', // 提示
      timer: -1, // 定时器
      winner: '', // 获胜者
    }
  },
  mounted() {
    this.drawChessboard()
  },
  methods: {
    drawChesses() {
      if (this.chessRecord) {
        this.chessRecord.forEach((chess) => {
          this.drawChess(chess)
        })
      }
    },
    drawChessboard() {
      if (this.$refs.chessboard.getContext) {
        let context = this.$refs.chessboard.getContext('2d')
        context.lineWidth = this.lineWidth
        context.beginPath()
        for (let i = 0; i < 15; i++) {
          // 行
          context.moveTo(
            this.boardPadding,
            this.boardPadding + (this.cellWidth + this.lineWidth) * i,
          )
          context.lineTo(
            this.boardPadding + (this.cellWidth + this.lineWidth) * 14,
            this.boardPadding + (this.cellWidth + this.lineWidth) * i,
          )
          // 列
          context.moveTo(
            this.boardPadding + (this.cellWidth + this.lineWidth) * i,
            this.boardPadding,
          )
          context.lineTo(
            this.boardPadding + (this.cellWidth + this.lineWidth) * i,
            this.boardPadding + (this.cellWidth + this.lineWidth) * 14,
          )
        }
        context.closePath()
        context.stroke()
      }
    },
    drawChess(chess) {
      const { x, y, player } = chess
      if (this.$refs.chesses.getContext) {
        let context = this.$refs.chesses.getContext('2d')
        context.beginPath()
        context.arc(
          this.boardPadding + (this.cellWidth + this.lineWidth) * x,
          this.boardPadding + (this.cellWidth + this.lineWidth) * y,
          this.chessRadius,
          0,
          Math.PI * 2,
        )
        context.fillStyle = player === '1' ? 'black' : 'white'
        context.fill()
      }
    },
    handleClick(event) {
      let mod = this.cellWidth + this.lineWidth
      let x = parseInt(event.offsetX / mod)
      let y = parseInt(event.offsetY / mod)
      let row = this.boardRecord[y]
      if (this.timer >= 0) {
        clearTimeout(this.timer)
        this.timer = -1
      }
      if (row[x] === '1' || row[x] === '2') {
        this.tip = '这里有棋子啦，请换个地方吧！'
        this.timer = setTimeout(() => {
          this.tip = ''
        }, 2000)
        return
      } else {
        this.tip = ''
      }
      let chess = { x: x, y: y, player: this.player }
      this.chessRecord.push(chess)
      row[x] = this.player
      // console.log(this.boardRecord)
      this.drawChess(chess)
      this.checkRow(chess)
      this.checkCol(chess)
      this.checkSlash(chess)
      this.checkBackSlash(chess)
      this.player = this.player === '1' ? '2' : '1'
    },
    checkRow(chess) {
      const { x, y, player } = chess
      let left = x - 1
      let right = x + 1
      let row = this.boardRecord[y]
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
        let row = this.boardRecord[top]
        if (row[x] !== player) {
          break
        }
        top--
      }
      while (bottom <= 14) {
        let row = this.boardRecord[bottom]
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
        let row = this.boardRecord[y1]
        if (row[x1] !== player) {
          break
        }
        x1++
        y1--
      }
      let x2 = x - 1
      let y2 = y + 1
      while (x2 >= 0 && y2 <= 14) {
        let row = this.boardRecord[y2]
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
        let row = this.boardRecord[y1]
        if (row[x1] !== player) {
          break
        }
        x1--
        y1--
      }
      let x2 = x + 1
      let y2 = y + 1
      while (x2 <= 14 && y2 <= 14) {
        let row = this.boardRecord[y2]
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
    begin() {
      this.playing = true
      this.chessboard = []
      this.boardRecord = []
      for (let i = 0; i < 15; i++) {
        let row = []
        for (let j = 0; j < 15; j++) {
          row[j] = '0'
        }
        this.boardRecord[i] = row
      }
      this.player = '1'
      this.winner = ''
      this.$refs.chesses
        .getContext('2d')
        .clearRect(0, 0, this.$refs.chesses.width, this.$refs.chesses.height)
      this.$refs.chesses.addEventListener('click', this.handleClick)
    },
    gameOver() {
      this.playing = false
      this.winner = this.player
      this.$refs.chesses.removeEventListener('click', this.handleClick)
    },
    end() {
      this.playing = false
      this.$refs.chesses.removeEventListener('click', this.handleClick)
    },
  },
}
</script>

<style scoped>
.gobang {
  display: flex;
}
.board {
  position: relative;
  width: 630px;
  height: 630px;
  /* margin: 0 auto; */
  background: #ffd75b;
}
canvas {
  position: absolute;
  left: 0;
  top: 0;
}
.game-over {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-top: 280px;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 70px;
  color: #ffffff;
}
.menu {
  padding: 10px 0;
  text-align: center;
}
.control {
  display: flex;
  flex-direction: column;
}
</style>
