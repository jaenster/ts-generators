import {GeneratorFrom} from "./generator-from";

export interface Transformer<In, Out> {
  on(event: 'data', cb: (v: Out) => any)
  on(event: 'close', cb: (v: Out) => any)

  off(event: string, cb: Function)
}

export abstract class Transformer<In=number, Out=number> extends GeneratorFrom<In> {

  constructor() {
    super()
    this.#runner().then(Boolean);
  }

  async #runner() {
    for await (const result of this.run()) {
      this.emit('data', result);
    }
  }

  write(t: In) {
    this.dispenser.add(t)
  }

  abstract run(): AsyncIterable<Out>
}