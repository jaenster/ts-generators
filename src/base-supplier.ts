import {FiFo} from "@jaenster/queues";
import {EventTS} from "@jaenster/events";

export abstract class BaseSupplier<M = any> {
  protected queue = new FiFo<M>()
  public readonly event = new EventTS()

  add(...data: M[]) {
    this.queue.add(...data);
    this.event.emit('added');
  }

  async close() {
    await this.waitForSize(0)
  }

  abstract [Symbol.asyncIterator](): AsyncIterator<M>;

  async waitForSize(n = 0) {
    while (this.queue.size > n) {
      await new Promise(resolve => this.event.once('done', resolve))
    }
  }

  protected next() {
    return this.queue.next()
  }
}