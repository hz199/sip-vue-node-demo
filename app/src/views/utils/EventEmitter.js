

class EventEmitter {
 
  constructor() {
    this.events = new Map()
    this.maxListeners = this.getMaxListeners()
    this.defaultMaxListeners = 10

    console.log('EventEmitter')
  }

  /**
   * get all eventNames
   */
  eventNames() {
    return [...this.events.keys()]
  }

  /**
   * setMaxListeners
   */
  setMaxListeners(num) {
    if(!num) {
      return false
    }
    this.maxListeners = num
  }

  /**
   * getMaxListeners
   */
  getMaxListeners() {
    return this.maxListeners || this.defaultMaxListeners
  }

  /**
   * attach a listener on a event
   * en: EventName, cb: Callback Function
   */
  on(en, cb) {
    console.log(this.events, en, 111)
    if(this.events.has(en)) {
      const cbArray = this.events.get(en)
      cbArray.push(cb)
    } else {
      this.events.set(en, [cb])
    }
  }

  /**
   * once
   */
  once() {
    
  }

  /**
   * remove one listener of a event , or remove all listeners of a event
   */
  removeListener(en, cb) {
    if(this.events.has(en)) {
      if(cb) {
        const cbArray = this.events.get(en)
        let cbIndex = -1
        cbArray.forEach((listener, index) => {
          if(listener === cb) {
            cbIndex = index
          }
        })
        if(cbIndex !== -1) {
          cbArray.splice(cbIndex, 1)
        }
      } else {
        this.events.delete(en)
      }
    }
  }

  /**
   * removeAllListener
   */
  removeAllListener() {
    this.events.clear()
  }

  /**
   * return listeners of some EventName
   */
  listeners(en) {
    if(this.events.has(en)) {
      return this.events.get(en)
    } else {
      return []
    }
  }

  /**
   * emit
   */
  emit(en, ...arg) {
    if (this.events.has(en)) {
      const cbArray = this.events.get(en)
      cbArray.forEach(listener => {
        listener.call(this, ...arg)
      })
    }
  }
}

export { EventEmitter }