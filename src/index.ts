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
  private manipulator: SyncObjectManipulator;

  constructor(payload: Event) {
    const data = payload.data.data
    if (isObject(data)) {
      this.manipulator = new ObjectValueManipulator(data)
    } else {
      this.manipulator = new PrimitiveValueManipulator(data as PossbilePrimitive)
    }
  }

  applyEvent(payload: Event) {
    this.manipulator.applyEvent(payload);
  }

  getObject(path: string): unknown {
    return this.manipulator.getObject(path)
  }
}

const isObject = (test: unknown): test is { [key: string]: unknown } => {
  return typeof test === 'object';
}

interface SyncObjectManipulator {
  applyEvent(payload: Event): void;
  getObject(path: string): unknown;
}

class ObjectValueManipulator implements SyncObjectManipulator {
  constructor(private data: { [key: string]: unknown }) { }

  applyEvent(payload: Event): void {
    const path = payload.data.path.startsWith('/')
      ? payload.data.path.slice(1) : payload.data.path
    switch (payload.event) {
      case "put": {
        this.data[path] = payload.data.data
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
    return this.data[path];
  }
}

type PossbilePrimitive = boolean | number | string;
class PrimitiveValueManipulator implements SyncObjectManipulator {
  constructor(private data: PossbilePrimitive) { }

  applyEvent(): void { }

  getObject(path: string): unknown {
    return this.data
  }
}
