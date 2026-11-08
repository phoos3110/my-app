import { after, before, beforeEach, test } from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// Chỉ dùng dự án demo và emulator, không tải cấu hình .env.local.
const projectId = "demo-react-auth-rules";
let environment;
const account = (uid) => environment.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore();
const profile = (uid) => ({ displayName: uid, email: `${uid}@example.com`, lastLoginAt: serverTimestamp() });

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Chạy bằng npm run test:rules để khởi động emulator.");
  environment = await initializeTestEnvironment({ projectId, firestore: { rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8") } });
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "roles", "admin"), { role: "admin" });
    await setDoc(doc(db, "roles", "alice"), { role: "user" });
    await setDoc(doc(db, "users", "alice"), profile("alice"));
    await setDoc(doc(db, "users", "bob"), profile("bob"));
  });
});
after(async () => { await environment?.cleanup(); });

test("khách chưa đăng nhập không đọc hoặc ghi dữ liệu", async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertFails(getDocs(collection(db, "users")));
  await assertFails(getDoc(doc(db, "roles", "admin")));
  await assertFails(setDoc(doc(db, "users", "guest"), profile("guest")));
});
test("user đọc được hồ sơ và vai trò của mình", async () => {
  const db = account("alice");
  await assertSucceeds(getDoc(doc(db, "users", "alice")));
  await assertSucceeds(getDoc(doc(db, "roles", "alice")));
});
test("user không đọc người khác hoặc liệt kê danh sách", async () => {
  const db = account("alice");
  await assertFails(getDoc(doc(db, "users", "bob")));
  await assertFails(getDoc(doc(db, "roles", "admin")));
  await assertFails(getDocs(collection(db, "users")));
  await assertFails(getDocs(collection(db, "roles")));
});
test("user chưa có document quyền vẫn đọc được trạng thái quyền của mình", async () => {
  const result = await assertSucceeds(getDoc(doc(account("new-user"), "roles", "new-user")));
  assert.equal(result.exists(), false);
});
test("admin đọc được danh sách và hồ sơ người dùng", async () => {
  const db = account("admin");
  await assertSucceeds(getDocs(collection(db, "users")));
  await assertSucceeds(getDocs(collection(db, "roles")));
  await assertSucceeds(getDoc(doc(db, "users", "bob")));
});
test("không ai được tự cấp hoặc sửa quyền từ website, kể cả admin", async () => {
  for (const uid of ["alice", "admin", "new-user"]) {
    const db = account(uid);
    await assertFails(setDoc(doc(db, "roles", uid), { role: "admin" }));
    await assertFails(setDoc(doc(db, "roles", "another-user"), { role: "admin" }));
  }
  await assertFails(deleteDoc(doc(account("admin"), "roles", "alice")));
});
test("người dùng tạo và cập nhật hồ sơ chính mình", async () => {
  await assertSucceeds(setDoc(doc(account("new-user"), "users", "new-user"), profile("new-user")));
  await assertSucceeds(setDoc(doc(account("alice"), "users", "alice"), { ...profile("alice"), displayName: "Alice mới" }, { merge: true }));
});
test("chặn giả email, sửa người khác, thêm role vào hồ sơ và thời gian giả", async () => {
  const db = account("alice");
  await assertFails(setDoc(doc(db, "users", "alice"), { ...profile("alice"), email: "admin@example.com" }));
  await assertFails(setDoc(doc(db, "users", "bob"), profile("bob")));
  await assertFails(setDoc(doc(db, "users", "alice"), { ...profile("alice"), role: "admin" }));
  await assertFails(setDoc(doc(db, "users", "alice"), { ...profile("alice"), lastLoginAt: new Date(0) }));
  await assertFails(setDoc(doc(db, "users", "alice"), { ...profile("alice"), displayName: "x".repeat(201) }));
});
test("user và admin không được xóa hồ sơ từ website", async () => {
  await assertFails(deleteDoc(doc(account("alice"), "users", "alice")));
  await assertFails(deleteDoc(doc(account("admin"), "users", "bob")));
});
test("thu hồi quyền admin có hiệu lực trên yêu cầu tiếp theo", async () => {
  const db = account("admin");
  await assertSucceeds(getDocs(collection(db, "users")));
  await environment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), "roles", "admin"), { role: "user" });
  });
  await assertFails(getDocs(collection(db, "users")));
});
