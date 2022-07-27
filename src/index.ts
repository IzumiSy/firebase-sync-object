import set from 'lodash/set';
import get from 'lodash/get';
import merge from 'lodash/merge';
import unset from 'lodash/unset';

// SSEにおける更新種別の表現
type SSEEventType
  = "put"
  | "patch"

// JS SDKにおける更新種別の表現
type UserEventType
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

export class SyncObject {
  private data: Object

  constructor(payload: Event) {
    this.data = payload.data.data
  }

  applyEvent(payload: Event): Object {
    const path = this.convertPathToDotted(payload.data.path)
    const data = payload.data.data

    switch (this.toMapUserEventType(payload)) {
      case "value": {
        this.data = data;
        return data
      }
      case "child_changed": {
        if (!isObject(this.data)) {
          this.data = data
          return data
        }

        set(this.data, path, data);
        if (path !== "") {
          const fields = path.split('.');
          const childKey = fields[0];
          return {
            [childKey]: this.data[childKey],
          };
        } else {
          return data
        }
      }
      case "child_removed": {
        const current = get(this.data, path)
        unset(this.data, path);
        return current
      }
      case "child_added": {
        this.data = path !== ""
          ? set(this.data, path, merge(get(this.data, path), data))
          : merge(this.data, data);
        return data
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
  private toMapUserEventType(payload: Event): UserEventType {
    switch (payload.event) {
      case "put":
        if (payload.data.data !== null) {
          if (payload.data.path === "") {
            return "value"
          } else {
            return "child_changed"
          }
        } else {
          return "child_removed"
        }
      case "patch":
        return "child_added"
    }
  }
}

const isObject = (test: unknown): test is { [key: string]: Object } => {
  return typeof test === 'object';
}
