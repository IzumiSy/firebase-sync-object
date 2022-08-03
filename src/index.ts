import set from 'lodash/set';
import get from 'lodash/get';
import merge from 'lodash/merge';
import unset from 'lodash/unset';

// SSEにおける更新種別の表現
type SSEEventType
  = "put"
  | "patch"

// JS SDKにおける更新種別の表現
type QueryEventType
  = "value"
  | "child_added"
  | "child_removed"
  | "child_changed"

interface EventData {
  path: string;
  data: Object;
}

interface Event {
  event: SSEEventType;
  data: EventData;
}

interface ApplyResult {
  event: QueryEventType;
  value: Object;
}

export class SyncObject {
  private data: Object

  constructor(payload: Event) {
    this.data = payload.data.data
  }

  applyEvent(payload: Event): ApplyResult {
    const path = this.convertPathToDotted(payload.data.path)
    const data = payload.data.data
    const event = this.toQueryEventType(payload)

    switch (event) {
      case "value": {
        this.data = data;
        return { event, value: data }
      }
      case "child_changed": {
        if (!isObject(this.data)) {
          this.data = data
          return { event, value: data }
        }

        set(this.data, path, data);
        if (path !== "") {
          // child_changedの監視はあくまで子孫までに限定されるため
          // 意図的にfields[0]のみを見るようにしている
          // (ref: https://stackoverflow.com/a/15164496)
          const fields = path.split('.');
          const childKey = fields[0];
          const value = { [childKey]: this.data[childKey] }
          return { event, value };
        } else {
          return { event, value: data }
        }
      }
      case "child_removed": {
        const current = get(this.data, path)
        unset(this.data, path);
        return { event, value: current }
      }
      case "child_added": {
        this.data = path !== ""
          ? set(this.data, path, merge(get(this.data, path), data))
          : merge(this.data, data);
        return { event, value: data }
      }
    }
  }

  getObject(): Object {
    return this.data
  }

  // スラッシュ繋ぎで表現されているパスをlodashのset/get/unsetで使えるように
  // ドット繋ぎのパス表現に変換する
  private convertPathToDotted(slashedPath: string): string {
    const trimmedPath = slashedPath.startsWith('/')
      ? slashedPath.slice(1) : slashedPath
    return trimmedPath.replace(/\//g, '.')
  }

  // SSEにおける更新の表現からJS SDKにおける更新の表現にマッピングする
  // 変換した方がパターンマッチがシンプルになって扱いやすい
  private toQueryEventType(payload: Event): QueryEventType {
    const path = this.convertPathToDotted(payload.data.path)
    const currentValue = get(this.data, path)

    switch (payload.event) {
      case "put":
      case "patch":
        if (payload.data.path !== "") {
          if (payload.data.data === null) {
            return "child_removed"
          } else if (currentValue === undefined) {
            return "child_added"
          } else {
            return "child_changed"
          }
        } else {
          return "value"
        }
    }
  }
}

const isObject = (test: unknown): test is { [key: string]: Object } => {
  return typeof test === 'object';
}
