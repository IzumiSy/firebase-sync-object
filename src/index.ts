// console.log("hello")

type EventType
  = "put"
  | "patch"

interface EventData {
  path: string;
  data: Object;
}

interface Event {
  event: EventType;
  data: EventData;
}

export class SyncObject {
  private manipulator: SyncObjectManipulator<Object | PossbilePrimitive>;

  constructor(payload: Event) {
    const data = payload.data.data
    if (isObject(data)) {
      this.manipulator = new ObjectValueManipulator(data)
    } else {
      this.manipulator = new PrimitiveValueManipulator(data as PossbilePrimitive)
    }
  }

  applyEvent(payload: Event) {
    const path = payload.data.path.startsWith('/')
      ? payload.data.path.slice(1) : payload.data.path
    this.manipulator.applyEvent(payload.event, path, payload.data.data);
  }

  getObject(path: string): unknown {
    return this.manipulator.getObject(path)
  }
}

const isObject = (test: unknown): test is { [key: string]: unknown } => {
  return typeof test === 'object';
}

interface SyncObjectManipulator<T> {
  // eventTypeにはkeep-aliveとかcancelとかがくるはずだが更新処理ではないため無視の実装をする
  applyEvent(eventType: EventType, path: string, data: T): void;
  getObject(path: string): unknown;
}

class ObjectValueManipulator implements SyncObjectManipulator<Object> {
  constructor(private data: { [key: string]: unknown }) { }

  applyEvent(eventType: EventType, path: string, data: Object): void {
    switch (eventType) {
      case "put": {
        this.data[path] = data
      }
      case "patch": {

      }
      default:
        return;
    }
  }

  getObject(path: string): unknown {
    return this.data[path];
  }
}

type PossbilePrimitive = boolean | number | string;
class PrimitiveValueManipulator implements SyncObjectManipulator<PossbilePrimitive> {
  constructor(private data: PossbilePrimitive) { }

  applyEvent(eventType: EventType, path: string, data: PossbilePrimitive): void {
    switch (eventType) {
      case "put": {
        this.data = data
      }
      case "patch": {

      }
      default:
        // 残りはkeep-aliveとかcancelとかがくるはずだが
        // 更新処理ではないため意図的に無視する
        return;
    }
  }

  getObject(path: string): unknown {
    return this.data
  }
}
