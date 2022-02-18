class History {
  constructor() {
    this.history = []
  }
  push(chess) {
    if (typeof chess === 'chess') this.history.push(chess)
  }
  pop() {
    this.history.pop()
  }
  test() {
    console.log('成功调用History类的test方法')
  }
}

export default new History()
