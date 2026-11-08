import test from "node:test";
import assert from "node:assert/strict";
import { filterUsers, paginateUsers } from "../src/lib/userList.js";

const at = (date) => ({ toMillis: () => new Date(date).getTime() });
const users = [
  {
    uid: "a",
    displayName: "Đặng An",
    email: "an@example.com",
    lastLoginAt: at("2026-11-01T10:00:00"),
  },
  {
    uid: "b",
    displayName: "Bình",
    email: "binh@example.com",
    lastLoginAt: at("2026-11-02T23:59:59"),
  },
  { uid: "c", displayName: "Chi", email: "chi@example.com" },
];

test("tìm không dấu kết hợp vai trò", () => {
  assert.deepEqual(
    filterUsers(users, { a: "admin" }, { search: "dang", role: "admin" }).map(
      (u) => u.uid,
    ),
    ["a"],
  );
  assert.deepEqual(
    filterUsers(users, { a: "admin" }, { role: "user" }).map((u) => u.uid),
    ["b", "c"],
  );
});
test("lọc ngày bao gồm cả cuối ngày và bỏ hồ sơ thiếu thời gian", () => {
  assert.deepEqual(
    filterUsers(users, {}, { from: "2026-11-02", to: "2026-11-02" }).map(
      (u) => u.uid,
    ),
    ["b"],
  );
  assert.equal(
    filterUsers(users, {}, { from: "2026-11-03", to: "2026-11-01" }).length,
    0,
  );
});
test("sắp xếp tên và thời gian không thay đổi mảng gốc", () => {
  assert.deepEqual(
    filterUsers(users, {}, { sort: "name-desc" }).map((u) => u.uid),
    ["a", "c", "b"],
  );
  assert.deepEqual(
    filterUsers(users, {}, { sort: "oldest" }).map((u) => u.uid),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    users.map((u) => u.uid),
    ["a", "b", "c"],
  );
});
test("phân trang rỗng, trang cuối và tự giới hạn trang khi dữ liệu giảm", () => {
  assert.deepEqual(paginateUsers([], 9, 10), {
    items: [],
    currentPage: 1,
    totalPages: 1,
    first: 0,
    last: 0,
  });
  const page = paginateUsers(users, 99, 2);
  assert.deepEqual(
    page.items.map((u) => u.uid),
    ["c"],
  );
  assert.equal(page.currentPage, 2);
  assert.equal(page.first, 3);
  assert.equal(page.last, 3);
});
