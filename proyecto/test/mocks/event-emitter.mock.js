class EventEmitter2 {
  emit(event, ...args) {
    return true;
  }
  emitAsync(event, ...args) {
    return Promise.resolve([]);
  }
  on(event, listener) {
    return this;
  }
  once(event, listener) {
    return this;
  }
  removeListener(event, listener) {
    return this;
  }
  removeAllListeners(event) {
    return this;
  }
}

const OnEvent = () => () => {};

class EventEmitterModule {
  static forRoot() {
    return {
      module: EventEmitterModule,
      providers: [EventEmitter2],
      exports: [EventEmitter2],
    };
  }
}

const EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
const EVENT_PAYLOAD = 'EVENT_PAYLOAD';

module.exports = {
  EventEmitter2,
  OnEvent,
  EventEmitterModule,
  EVENT_LISTENER_METADATA,
  EVENT_PAYLOAD,
};
