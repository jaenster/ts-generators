import {Transformer} from "../src/transformer";

const delay = (ms?) => new Promise((resolve) => setTimeout(resolve, ms));
describe('test', function () {

    it('test', async function () {
        class TimesTwo extends Transformer {
            async* run() {
                for await (const value of this) {
                    yield value * 2;
                }
            }
        }

        const worker = new TimesTwo();

        let recv: number
        worker.on('data', data => recv = data)
        worker.write(5);

        await delay();
        expect(recv).toBe(10);
    })


});