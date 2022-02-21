import MoveChess from '@/utils/moveChess'
import { player, board } from '@/utils/constant'

/**
 * 绘制棋子
 * @version 0.1.0
 * @since 0.1.1
 */
const drawChess = {
  data() {
    return {
      blackImgSrc: require('@/assets/black.png'),
      whiteImgSrc: require('@/assets/white.png'),
    }
  },
  methods: {
    /**
     * 绘制棋子
     * @param {MoveChess} moveChess 着 - 记录落子的位置和行棋方
     */
    drawChess(moveChess) {
      console.log(`drawChess(${moveChess})`)
      if (moveChess.constructor !== MoveChess) {
        throw new TypeError('moveChess参数必须为MoveChess实例.')
      }
      let ctx = this.$refs.chesses.getContext('2d')
      let img = document.createElement('img')
      img.style.display = 'none'
      document.getElementById('app').appendChild(img)
      let x =
        board.padding +
        (this.cellWidth + board.lineWidth) * moveChess.x -
        (this.cellWidth >> 1)
      let y =
        board.padding +
        (this.cellWidth + board.lineWidth) * moveChess.y -
        (this.cellWidth >> 1)
      img.onload = () =>
        ctx.drawImage(img, x, y, this.cellWidth, this.cellWidth)
      img.src =
        moveChess.player === player.A ? this.blackImgSrc : this.whiteImgSrc
    },
    // test() {
    //   console.log('drawChess测试成功')
    // },
  },
}

export default drawChess
