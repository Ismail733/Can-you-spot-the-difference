import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from './queue';

describe('DetectionDifferenceService', () => {
    let service: Queue;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [Queue],
        }).compile();
        service = module.get<Queue>(Queue);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should be peek no value since its empty', () => {
        const peek = service.peek();
        expect(peek).toBeUndefined();
    });
    it('should be peek no value since its empty', () => {
        const peek = service.peek();
        expect(peek).toBeUndefined();
    });
    it('should be peek no value since its empty', () => {
        service.enqueue(1);
        const peek = service.peek();
        expect(peek).toBe(1);
    });
    it('should be peek no value since its empty', () => {
        service.enqueue(1);
        const dequeued = service.dequeue();
        expect(dequeued).toBe(1);
    });
});
