import test from "node:test";
import assert from "node:assert/strict";
import { pauseWhenOffscreen } from "../src/offscreen.ts";

test("sections share observation, pause while hidden, resume in phase and release resources", () => {
  const previousDocument = globalThis.document;
  const previousObserver = globalThis.IntersectionObserver;
  class FakeDocument extends EventTarget { hidden = false; }
  class Observer {
    static instances = [];
    nodes = new Set();
    disconnected = false;
    constructor(callback, options) { this.callback = callback; this.options = options; Observer.instances.push(this); }
    observe(node) { this.nodes.add(node); }
    unobserve(node) { this.nodes.delete(node); }
    disconnect() { this.disconnected = true; this.nodes.clear(); }
    intersect(node, value) { this.callback([{ target: node, isIntersecting: value }]); }
  }
  const element = () => ({
    attributes: new Set(),
    toggleAttribute(name, present) { if (present) this.attributes.add(name); else this.attributes.delete(name); },
    removeAttribute(name) { this.attributes.delete(name); },
    paused() { return this.attributes.has("data-off"); },
  });
  globalThis.document = new FakeDocument();
  globalThis.IntersectionObserver = Observer;
  const changes = [];
  const first = element();
  const second = element();
  const cleanups = [];
  try {
    cleanups.push(pauseWhenOffscreen(first, "150px 0px", active => changes.push(active)));
    cleanups.push(pauseWhenOffscreen(second));
    assert.equal(Observer.instances.length, 1);
    assert.equal(first.paused(), true);
    const observer = Observer.instances[0];
    observer.intersect(first, true);
    observer.intersect(first, true);
    assert.deepEqual(changes, [false, true], "identical observations do not repeat callbacks");
    document.hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(first.paused(), true);
    document.hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(first.paused(), false);
    assert.equal(second.paused(), true, "a background round trip does not start offscreen sections");
    cleanups.shift()();
    assert.equal(observer.nodes.size, 1);
    assert.equal(first.paused(), false);
    cleanups.shift()();
    assert.equal(observer.disconnected, true);
    assert.equal(second.paused(), false);
    // StrictMode remounts must attach a new observer and visibility subscription.
    cleanups.push(pauseWhenOffscreen(first));
    assert.equal(Observer.instances.length, 2);
    Observer.instances[1].intersect(first, true);
    document.hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(first.paused(), true);
  } finally {
    cleanups.forEach(cleanup => cleanup());
    globalThis.document = previousDocument;
    globalThis.IntersectionObserver = previousObserver;
  }
});
