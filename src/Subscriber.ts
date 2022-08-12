import EventSource from 'eventsource';
import { SyncObject, EventData } from './SyncObject';

interface EventSourceLike {
  addEventListener(type: string, listener: (evt: MessageEvent) => void): void;
}

const createEventSource = (url: string): EventSourceLike =>
  new EventSource(url);


class Synchronizer {
  private syncObject?: SyncObject;
  private eventSource: EventSourceLike;

  constructor(
    url: string,
    connector: (url: string) => EventSourceLike = createEventSource,
  ) {
    this.eventSource = connector(url);
    this.eventSource.addEventListener('open', this.onOpen.bind(this))
    this.eventSource.addEventListener('put', e => this.onUpdate('put', e))
    this.eventSource.addEventListener('patch', e => this.onUpdate('patch', e))
    this.eventSource.addEventListener('error', this.onError.bind(this))
  }

  private onOpen(event: MessageEvent<EventData>) {
    // open event sends an initial data for the subscribing path.
    this.syncObject = new SyncObject(event)
  }

  private onUpdate(type: 'put' | 'patch', event: MessageEvent<EventData>) {
    if (!this.syncObject) return
    const result = this.syncObject.applyEvent(type, event);
  }

  private onError(event: MessageEvent<EventData>) {
    if (!this.syncObject) return
    // TODO
  }
}

export class Subscriber {
  private baseURL: string
  private syncObjects: Map<string, Synchronizer>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.syncObjects = new Map();
  }

  onValue(path: string, cb: () => void) { }
  onChildAdded(path: string, cb: () => void) { }
  onChildRemoved(path: string, cb: () => void) { }
  onChildChanged(path: string, cb: () => void) { }
}
