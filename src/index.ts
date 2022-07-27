import set from 'lodash/set';
import get from 'lodash/get';
import update from 'lodash/update';
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

  applyEvent(payload: Event) {
    const path = this.convertPathToDotted(payload.data)
    const data = payload.data.data

    switch (this.toMapUserEventType(payload)) {
      case "value": this.data = data; break;
      case "child_added": set(this.data, path, data); break;
      case "child_removed": unset(this.data, path); break;
      case "child_changed":
        const current = path !== "" ? get(this.data, path) : this.data
        this.data = merge(current, data);
        break;
    }
  }

  getObject(path: string): unknown {
    return path !== ""
      ? get(this.data, path.replace(/\//g, '.'), this.data) : this.data
  }

  // スラッシュ繋ぎで表現されているパスをlodashのset/get/unsetで使えるように
  // ドット繋ぎのパス表現に変換する
  private convertPathToDotted(eventData: EventData): string {
    const slashedPath = eventData.path
    const trimmedPath = slashedPath.startsWith('/')
      ? slashedPath.slice(1) : slashedPath
    return trimmedPath.replace(/\//g, '.')
  }

  // SSEにおける更新の表現からJS SDKにおける更新の表現にマッピングする
  private toMapUserEventType(payload: Event): UserEventType {
    switch (payload.event) {
      case "put":
        if (payload.data.data !== null) {
          if (payload.data.path === "") {
            return "value"
          } else {
            return "child_added"
          }
        } else {
          return "child_removed"
        }
      case "patch":
        return "child_changed"
    }
  }
}
