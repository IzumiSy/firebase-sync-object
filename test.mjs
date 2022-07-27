import test from 'ava';
import { SyncObject } from './dist/index.js';

test('getting a field simply', t => {
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

test('changing a value field', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "",
      data: 10,
    },
  })

  syncObject.applyEvent({
    event: "put",
    data: {
      path: "",
      data: 20,
    }
  })

  const result = syncObject.getObject("foo")
  t.is(result, 20);
});

test('changing a value field in objects', t => {
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

  const values = syncObject.getObject("")
  t.is(Object.keys(values).length, 3)

  const result = syncObject.getObject("foo")
  t.is(result, 15);
});

test('changing an object field in objects', t => {
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


  syncObject.applyEvent({
    event: "put",
    data: {
      path: "/bar/age",
      data: 30,
    }
  })

  const values = syncObject.getObject("")
  t.is(Object.keys(values).length, 2)

  const result = syncObject.getObject("foo")
  t.deepEqual(result, {
    name: "alexandor",
    age: 20,
  })

  const result2 = syncObject.getObject("bar")
  t.deepEqual(result2, {
    name: "michael",
    age: 30,
  })
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
      path: "/",
      data: {
        baz: {
          name: "alexandor",
          age: 30,
        },
      },
    }
  })

  const values = syncObject.getObject("")
  t.is(Object.keys(values).length, 3)

  const result = syncObject.getObject("baz")
  t.deepEqual(result, {
    name: "alexandor",
    age: 30,
  });
});

test('removing a child', t => {
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
      data: null,
    },
  })

  const values = syncObject.getObject("")
  t.is(Object.keys(values).length, 2)
})

test('removing a nested child', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "/",
      data: {
        values: {
          foo: 10,
          bar: 20,
          baz: 30,
        },
      },
    },
  })

  syncObject.applyEvent({
    event: "put",
    data: {
      path: "/values/foo",
      data: null,
    },
  })

  const values = syncObject.getObject("values")
  t.is(Object.keys(values).length, 2)
})
