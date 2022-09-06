import {GeneratorFrom} from "../src";
interface Emitter<T> {
  on(event: 'data', listener: (data: T) => any): this;

  on(event: 'close', listener: (...[]) => any): this;

  off(event: any, listener: (...[]) => any): this;
}


export class GeneratorFromEmitter<T> extends GeneratorFrom<T> {
  constructor(protected emitter: Emitter<T>) {
    super();

    const onData = (a) => this.dispenser.add(a);
    const onClose = () => {
      this.emitter.off('data', onData)
      this.emitter.off('data', onClose)
      return this.close();
    };

    this.emitter.on('data', (a) => this.dispenser.add(a))
    this.emitter.on('close', onClose)
  }
}