import test from 'ava';
import { SyncObject } from './dist/index.js';

test('noop', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "/",
      data: {
        foo: 10,
        bar: 20,
        baz: 30,
      },
    },
  })

  const result = syncObject.getObject("bar")
  t.is(result, 20)
})

test('replacing a field', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "/",
      data: {
        foo: 10,
        bar: 20,
        baz: 30,
      },
    },
  })

  syncObject.applyEvent({
    event: "put",
    data: {
      path: "/foo",
      data: 15,
    }
  })

  const result = syncObject.getObject("foo")
  t.is(result, 15);
});

test('replacing a field in objects', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "/",
      data: {
        foo: {
          name: "justine",
          age: 20,
        },
        bar: {
          name: "michael",
          age: 25,
        },
      },
    },
  })

  syncObject.applyEvent({
    event: "put",
    data: {
      path: "/foo/name",
      data:  "alexandor",
    }
  })

  const result = syncObject.getObject("foo")
  t.is(result, {
    name: "alexandor",
    age: 20,
  });
});

test('appending a child', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "/",
      data: {
        foo: {
          name: "justine",
          age: 20,
        },
        bar: {
          name: "michael",
          age: 25,
        },
      },
    },
  })

  syncObject.applyEvent({
    event: "patch",
    data: {
      path: "/foo",
      data: {
        baz: {
          name: "alexandor",
          age: 30,
        },
      },
    }
  })

  const result = syncObject.getObject("baz")
  t.is(result, {
    name: "alexandor",
    age: 30,
  });
});
