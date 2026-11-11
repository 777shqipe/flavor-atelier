import test from "node:test";
import assert from "node:assert/strict";
import { pageUrl, routeFromLocation } from "../src/navigation.ts";

const location = (pathname = "/", hash = "", search = "") => ({ pathname, hash, search });

test("direct links and reloads select each page in every supported language", () => {
  for (const prefix of ["", "/vi", "/zh", "/it", "/ja"]) {
    for (const page of ["home", "stores", "about"]) {
      const url = pageUrl(page, undefined, location(`${prefix}/`));
      assert.equal(routeFromLocation(location(url)).page, page);
    }
  }
});

test("navigation preserves language, search and encoded anchors", () => {
  assert.equal(pageUrl("about", "suppliers", location("/it/stores", "#old", "?campaign=one")), "/it/about?campaign=one#suppliers");
  assert.deepEqual(routeFromLocation(location("/ja/about/", "#supplier%20info")), { page: "about", anchor: "supplier info" });
});

test("legacy contact/supplier links still open the about page", () => {
  assert.equal(routeFromLocation(location("/", "#contact")).page, "about");
  assert.equal(routeFromLocation(location("/it/", "#suppliers")).page, "about");
  assert.equal(routeFromLocation(location("/it/stores", "#contact")).page, "stores");
});

test("malformed fragments cannot crash initial navigation", () => {
  assert.deepEqual(routeFromLocation(location("/stores", "#%E0%A4%A")), { page: "stores", anchor: undefined });
  assert.equal(routeFromLocation(location("/unknown")).page, "home");
});
