import MoveChess from './moveChess'

class History {
  constructor() {
    this.history = []
  }
  push(chess) {
    if (chess.constructor === MoveChess) this.history.push(chess)
  }
  pop() {
    this.history.pop()
  }
  /**
   * 清空历史记录
   */
  clear() {
    this.history = []
  }
  get() {
    return this.history
  }
  forEach(callbackfn) {
    this.history.forEach(callbackfn)
  }
  test() {
    console.log('成功调用History类的test方法')
  }
}

export default new History()
