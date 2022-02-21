import { player as players } from './constant.js'

/**
 * 着 - 记录落子的位置和行棋方
 * @author wowpH
 * @version 0.1.0
 * @since 0.1.1
 */
export default class MoveChess {
  constructor(x, y, player) {
    if (x < 0 || x > 14) {
      throw new Error(`x(${x})越界, x的取值范围是[0, 14].`)
    }
    if (y < 0 || y > 14) {
      throw new Error(`y(${y})越界, y的取值范围是[0, 14].`)
    }
    if (![players.A, players.B].includes(player)) {
      throw new Error(
        `player(${player})不合法, player的取值范围是[${players.A}, ${players.B}].`,
      )
    }
    this.x = x
    this.y = y
    this.player = player
  }
  toString() {
    return `(${this.x}, ${this.y}, ${this.player})`
  }
}
