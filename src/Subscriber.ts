import EventSource from 'eventsource';
import { SyncObject, EventData, QueryEventType, SSEEventType } from './SyncObject';

type Path = string;

export class Subscriber {
  private synchronizers: Map<Path, Synchronizer>;

  constructor(
    private baseURL: string,
    private connector: Connector = createEventSource,
  ) {
    this.baseURL = baseURL;
    this.connector = connector
    this.synchronizers = new Map();
  }

  private registerCallback(path: Path, type: QueryEventType, cb: Callback) {
    const synchronizer = this.synchronizers.get(path)
    if (synchronizer === undefined) {
      const newSynchronizer = new Synchronizer(this.baseURL, this.connector);
      newSynchronizer.registerCallback(type, cb);
      this.synchronizers.set(path, newSynchronizer);
    } else {
      synchronizer.registerCallback(type, cb);
      this.synchronizers.set(path, synchronizer);
    }
  }

  onValue(path: Path, cb: Callback) {
    this.registerCallback(path, 'value', cb);
  }

  onChildAdded(path: Path, cb: Callback) {
    this.registerCallback(path, 'child_added', cb);
  }

  onChildRemoved(path: Path, cb: Callback) {
    this.registerCallback(path, 'child_removed', cb);
  }

  onChildChanged(path: Path, cb: Callback) {
    this.registerCallback(path, 'child_changed', cb);
  }
}

interface EventSourceLike {
  addEventListener(type: string, listener: (evt: MessageEvent) => void): void;
}

type Connector = (url: string) => EventSourceLike

const createEventSource = (url: string): EventSourceLike =>
  new EventSource(url);

class Synchronizer {
  private syncObject?: SyncObject;
  private eventSource: EventSourceLike;
  private callbacks: Callbacks;

  constructor(url: string, connector: Connector) {
    this.eventSource = connector(url);
    this.eventSource.addEventListener('open', this.onOpen.bind(this))
    this.eventSource.addEventListener('put', e => this.onUpdate('put', e))
    this.eventSource.addEventListener('patch', e => this.onUpdate('patch', e))
    this.eventSource.addEventListener('error', this.onError.bind(this))
    this.callbacks = new Callbacks();
  }

  private onOpen(event: MessageEvent<EventData>) {
    this.syncObject = new SyncObject(event)
  }

  private onUpdate(type: SSEEventType, event: MessageEvent<EventData>) {
    if (!this.syncObject) return
    const result = this.syncObject.applyEvent(type, event);
    this.callbacks.runCallbacks(result.event, result.value);
  }

  private onError(event: MessageEvent<EventData>) {
    if (!this.syncObject) return
    // TODO
  }

  registerCallback(type: QueryEventType, callback: Callback) {
    this.callbacks.registerCallback(type, callback);
  }
}

type Callback = (value: Object) => void;

export class Callbacks {
  private callbacks: Map<QueryEventType, Callback[]>;

  constructor() {
    this.callbacks = new Map();
  }

  registerCallback(type: QueryEventType, callback: Callback) {
    const callbacks = this.callbacks.get(type);
    if (callbacks === undefined) {
      this.callbacks.set(type, [callback]);
    } else {
      this.callbacks.set(type, [...callbacks, callback]);
    }
  }

  runCallbacks(type: QueryEventType, value: Object) {
    const callbacks = this.callbacks.get(type);
    if (callbacks !== undefined) {
      callbacks.forEach(callback => callback(value));
    }
  }
}
