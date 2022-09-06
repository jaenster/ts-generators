import {Supplier} from "./supplier";
import {EventTS} from "@jaenster/events";
import {getPromise} from "./get-promise";

export class GeneratorFrom<T> extends EventTS {
  protected dispenser = new Supplier<T>();
  protected subscriptions = new Set<Supplier<T>>()
  protected toBeCanceled = new Set<ReturnType<typeof getPromise>>()

  constructor() {
    super()
    this.#runner().then(Boolean);
  }

  async #runner() {
    for await (const result of this.dispenser) {
      this.subscriptions.forEach(queue => queue.add(result));
    }
  }

  async close() {
    this.toBeCanceled.forEach(queue => queue.resolve(undefined));
    while (this.subscriptions.size) {
      for (const subscription of this.subscriptions) {
        await subscription.close();
      }
    }
  }

  protected removeSubscription(queue: Supplier<T>) {
    this.subscriptions.delete(queue);
  }

  protected addSubscription(queue: Supplier<T>) {
    this.subscriptions.add(queue);
  }

  protected addToBeCanceled(queue: Supplier<T>) {
    const cancel = getPromise();
    this.toBeCanceled.add(cancel);
    return {
      promise: Promise.race([queue.waitForNext(), cancel.promise]) as Promise<T>,
      cancel
    };
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    const queue = new Supplier<T>();
    this.addSubscription(queue);

    const stop = async () => {
      this.removeSubscription(queue)
      queue.event.emit('stop');
      return {done: true, value: undefined}
    }

    return {
      next: async () => {
        const {promise, cancel} = this.addToBeCanceled(queue);
        try {
          const value = await promise;
          return {done: !value, value}
        } finally {
          this.toBeCanceled.delete(cancel);
        }
      },
      return: stop,
      throw: stop,
    }
  }
}