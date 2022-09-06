import {Synchronized} from "@jaenster/synchronized";
import {BaseSupplier} from "./base-supplier";
import {getPromise} from "./get-promise";

export class Supplier<M = any> extends BaseSupplier<M>{

  async* [Symbol.asyncIterator]() {
    let job: M;
    while (job = await this.waitForNext()) {
      yield job;
    }
  }

  @Synchronized()
  async waitForNext(): Promise<M> {
    if (this.queue.has()) return this.next();

    const {promise, resolve} = getPromise();
    this.event.once('added', resolve).once('stop', resolve)
    await promise;

    return this.next();
  }

}