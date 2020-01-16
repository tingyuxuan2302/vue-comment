/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * getter依赖收集的核心（实际上是对类Watcher的一种管理）
 */
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher; // 静态属性target(Watcher类型)
  id: number;
  subs: Array<Watcher>; // 一个（Watcher类型）数组

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    /**
     * 为后续数据变化时候能通知到哪些 subs 做准备
     */
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    /**
     * 所有Watcher的实例对象
     */
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
/**
 * 把Dep.target恢复成上一个状态
 *
 * @param     {boolean}    xx     []
 * @returns    {undefined}      无
 */
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
