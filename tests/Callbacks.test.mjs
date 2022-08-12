import test from 'ava';
import { Callbacks } from '../dist/Subscriber.js';

class CounterSpy {
  constructor(calledCount) {
    this.calledCount = 0
  }

  onCall() {
    this.calledCount++
  }

  value() {
    return this.calledCount
  }
}

test('register and run callbacks', t => {
  const callbacks = new Callbacks();

  const valueSpy = new CounterSpy();
  callbacks.registerCallback('value', valueSpy.onCall.bind(valueSpy))
  callbacks.registerCallback('value', valueSpy.onCall.bind(valueSpy))
  callbacks.runCallbacks('value', 1);
  t.is(valueSpy.value(), 2);

  const childAddedSpy = new CounterSpy();
  callbacks.registerCallback('child_added', childAddedSpy.onCall.bind(childAddedSpy))
  callbacks.registerCallback('child_added', childAddedSpy.onCall.bind(childAddedSpy))
  callbacks.runCallbacks('child_added', 1);
  t.is(childAddedSpy.value(), 2);

  const childRemovedSpy = new CounterSpy();
  callbacks.registerCallback('child_removed', childRemovedSpy.onCall.bind(childRemovedSpy))
  callbacks.registerCallback('child_removed', childRemovedSpy.onCall.bind(childRemovedSpy))
  callbacks.runCallbacks('child_removed', 1);
  t.is(childRemovedSpy.value(), 2);

  const childChangedSpy = new CounterSpy();
  callbacks.registerCallback('child_changed', childChangedSpy.onCall.bind(childChangedSpy))
  callbacks.registerCallback('child_changed', childChangedSpy.onCall.bind(childChangedSpy))
  callbacks.runCallbacks('child_changed', 1);
  t.is(childChangedSpy.value(), 2);

  callbacks.runCallbacks('value', 1);
  t.is(valueSpy.value(), 4);
  callbacks.runCallbacks('child_added', 1);
  t.is(childAddedSpy.value(), 4);
  callbacks.runCallbacks('child_removed', 1);
  t.is(childRemovedSpy.value(), 4);
  callbacks.runCallbacks('child_changed', 1);
  t.is(childChangedSpy.value(), 4);
})
