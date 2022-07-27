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

  const result = syncObject.getObject()
  t.deepEqual(result, {
    foo: 10,
    bar: 20,
    baz: 30,
  })
})

test('changing a value field', t => {
  const syncObject = new SyncObject({
    event: "put",
    data: {
      path: "",
      data: 10,
    },
  })

  const applyResult = syncObject.applyEvent({
    event: "put",
    data: {
      path: "",
      data: 20,
    }
  })
  t.is(applyResult, 20)

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

  const applyResult = syncObject.applyEvent({
    event: "put",
    data: {
      path: "/foo",
      data: 15,
    }
  })
  t.deepEqual(applyResult, {
    foo: 15,
  })

  const result = syncObject.getObject()
  t.deepEqual(result, {
    foo: 15,
    bar: 20,
    baz: 30,
  });
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

  const applyResult1 = syncObject.applyEvent({
    event: "put",
    data: {
      path: "/foo/name",
      data:  "alexander",
    }
  })
  t.deepEqual(applyResult1, {
    foo: {
      name: "alexander",
      age: 20,
    },
  })


  const applyResult2 = syncObject.applyEvent({
    event: "put",
    data: {
      path: "/bar/age",
      data: 30,
    }
  })
  t.deepEqual(applyResult2, {
    bar: {
      name: "michael",
      age: 30,
    },
  })

  const result = syncObject.getObject()
  t.deepEqual(result, {
    foo: {
      name: "alexander",
      age: 20,
    },
    bar: {
      name: "michael",
      age: 30,
    },
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

  const applyResult = syncObject.applyEvent({
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
  t.deepEqual(applyResult, {
    baz: {
      name: "alexandor",
      age: 30,
    },
  });

  const result = syncObject.getObject()
  t.deepEqual(result, {
    foo: {
      name: "justine",
      age: 20,
    },
    bar: {
      name: "michael",
      age: 25,
    },
    baz: {
      name: "alexandor",
      age: 30,
    },
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

  const applyResult = syncObject.applyEvent({
    event: "put",
    data: {
      path: "/foo",
      data: null,
    },
  })
  t.is(applyResult, 10)

  const values = syncObject.getObject()
  t.deepEqual(values, {
    bar: 20,
    baz: 30,
  })
})
