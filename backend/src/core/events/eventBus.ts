import { logger } from '../utils/logger';

type EventHandler = (data: any) => Promise<void> | void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    logger.debug(`Event handler registered: ${event}`);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async emit(event: string, data: any): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers || handlers.length === 0) {
      logger.debug(`No handlers for event: ${event}`);
      return;
    }

    logger.info(`Event emitted: ${event}`);

    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (error) {
        logger.error(`Error in event handler for ${event}:`, (error as Error).message);
      }
    }
  }

  listEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBus = new EventBus();
