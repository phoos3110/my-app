import UserDetailsDialog from "@/components/UserDetailsDialog";
import TablePagination from "@/components/TablePagination";
import { filterUsers, paginateUsers } from "@/lib/userList";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Search,
  LogOut,
  ShieldCheck,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { watchUsers, watchRoles } from "@/services/userService";

function formatDate(value) {
  return value?.toDate
    ? value.toDate().toLocaleString("vi-VN")
    : "Chưa có dữ liệu";
}

export default function AdminDashboard({ user, onLogout, loading }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    sort: "latest",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({ users: "", roles: "" });
  const [retryKey, setRetryKey] = useState(0);
  const [rolesReady, setRolesReady] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fail = (source, label) => (err) => {
      if (!active) return;
      setErrors((previous) => ({
        ...previous,
        [source]: `Không thể tải ${label}. (${err.code})`,
      }));
      if (source === "users") {
        setUsers([]);
        setFetching(false);
      } else {
        setRoles({});
        setRolesReady(false);
      }
    };
    const stopUsers = watchUsers(
      (items) => {
        if (!active) return;
        setUsers(items);
        setErrors((previous) => ({ ...previous, users: "" }));
        setFetching(false);
      },
      fail("users", "danh sách người dùng"),
    );
    const stopRoles = watchRoles(
      (items) => {
        if (!active) return;
        setRoles(items);
        setRolesReady(true);
        setErrors((previous) => ({ ...previous, roles: "" }));
      },
      fail("roles", "vai trò người dùng"),
    );
    return () => {
      active = false;
      stopUsers();
      stopRoles();
    };
  }, [user, retryKey]);

  const invalidDateRange =
    filters.from && filters.to && filters.from > filters.to;
  const roleUnavailable = filters.role !== "all" && !rolesReady;
  const filteredUsers =
    invalidDateRange || roleUnavailable
      ? []
      : filterUsers(users, roles, { search, ...filters });
  const pagination = paginateUsers(filteredUsers, page, pageSize);
  function updateFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  }
  const selected = users.find((item) => item.uid === selectedUid);

  return (
    <div className="min-h-dvh min-w-0 bg-slate-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-4 border-b bg-white px-4 py-3 sm:p-6 lg:min-h-dvh lg:gap-8 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-3 font-semibold">
          <LayoutDashboard className="text-primary" aria-hidden="true" />
          Admin Dashboard
        </div>
        <nav aria-label="Quản trị" className="hidden lg:block">
          <span
            aria-current="page"
            className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3 text-sm font-medium text-primary"
          >
            <Users className="size-4" aria-hidden="true" />
            Quản lý người dùng
          </span>
        </nav>
        <div className="mt-auto hidden text-xs text-muted-foreground lg:block">
          Khu vực quản trị
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{user.displayName || user.email}</span>
            <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-xs text-primary">
              Admin
            </span>
          </div>
          <Button className="h-11 shrink-0" variant="outline" onClick={onLogout} disabled={loading}>
            <LogOut aria-hidden="true" />
            Đăng xuất
          </Button>
        </header>
        <main className="mx-auto grid min-w-0 max-w-6xl gap-4 p-3 sm:gap-6 sm:p-8">
          <div>
            <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground">
              DASHBOARD
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Quản lý người dùng
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Danh sách hồ sơ đã đồng bộ từ các lần đăng nhập website.
            </p>
          </div>
          {(errors.users || errors.roles) && (
            <Alert variant="destructive">
              <AlertDescription>
                {errors.users && <p>{errors.users}</p>}
                {errors.roles && <p>{errors.roles}</p>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFetching(true);
                    setRolesReady(false);
                    setRetryKey((key) => key + 1);
                  }}
                >
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <Card className="min-w-0 gap-4 py-4 sm:gap-6 sm:py-6">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Danh sách tài khoản</CardTitle>
              <CardDescription>
                {users.length} hồ sơ. Vai trò được cập nhật từ Firebase Console.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 px-4 sm:px-6">
              <label className="mb-3 flex min-h-11 items-center gap-3 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-ring/50">
                <Search
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm"
                  aria-label="Tìm người dùng"
                  placeholder="Tìm theo tên, email hoặc UID…"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <Button variant="outline" className="mb-4 h-11 w-full sm:hidden" aria-expanded={filtersOpen} aria-controls="user-filters" onClick={() => setFiltersOpen((open) => !open)}>
                <SlidersHorizontal aria-hidden="true" />{filtersOpen ? "Thu gọn bộ lọc" : "Lọc và sắp xếp"}
                {(filters.role !== "all" || filters.from || filters.to) && <span className="size-2 rounded-full bg-primary" aria-label="Đang áp dụng bộ lọc" />}
              </Button>
              <div id="user-filters" className={`${filtersOpen ? "grid" : "hidden"} mb-5 min-w-0 items-end gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-5 [&_input]:h-11 [&_input]:w-full [&_input]:text-base [&_select]:h-11 [&_select]:min-w-0 [&_select]:w-full [&_select]:text-base sm:[&_input]:text-sm sm:[&_select]:text-sm [&>label]:min-w-0 [&>button]:h-11`}>
                <label className="grid gap-2 text-sm">
                  Vai trò
                  <select
                    className="h-10 rounded-lg border bg-white px-3"
                    value={filters.role}
                    onChange={(event) =>
                      updateFilter("role", event.target.value)
                    }
                    disabled={!rolesReady}
                  >
                    <option value="all">Tất cả</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Sắp xếp
                  <select
                    className="h-10 rounded-lg border bg-white px-3"
                    value={filters.sort}
                    onChange={(event) =>
                      updateFilter("sort", event.target.value)
                    }
                  >
                    <option value="latest">Đăng nhập mới nhất</option>
                    <option value="oldest">Đăng nhập cũ nhất</option>
                    <option value="name-asc">Tên A–Z</option>
                    <option value="name-desc">Tên Z–A</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Đăng nhập từ ngày
                  <input
                    type="date"
                    className="h-10 min-w-0 rounded-lg border bg-white px-3"
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={(event) =>
                      updateFilter("from", event.target.value)
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Đến ngày
                  <input
                    type="date"
                    className="h-10 min-w-0 rounded-lg border bg-white px-3"
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={(event) => updateFilter("to", event.target.value)}
                  />
                </label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilters({
                      role: "all",
                      sort: "latest",
                      from: "",
                      to: "",
                    });
                    setPage(1);
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
              {invalidDateRange && (
                <p role="alert" className="mb-4 text-sm text-destructive">
                  Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.
                </p>
              )}
              {roleUnavailable && (
                <p role="status" className="mb-4 text-sm text-muted-foreground">
                  Chưa tải được vai trò. Hãy thử tải lại dữ liệu để lọc.
                </p>
              )}
              {fetching ? (
                <div role="status" className="flex justify-center py-12">
                  <Spinner aria-label="Đang tải người dùng" />
                </div>
              ) : (
                <div className="min-w-0">
                  <ul className="grid gap-3 md:hidden" aria-label="Danh sách người dùng">
                    {pagination.items.map((item) => (
                      <li key={item.uid} className="min-w-0 rounded-xl border bg-white p-3">
                        <div className="flex items-start gap-3">
                          <UserRound className="size-10 shrink-0 rounded-full bg-slate-100 p-2 text-slate-500" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="wrap-anywhere text-sm font-semibold">{item.displayName || "Chưa có tên"}</p>
                            <p className="mt-1 wrap-anywhere text-xs text-muted-foreground">{item.email}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-xs text-primary">{!rolesReady ? "—" : roles[item.uid] === "admin" ? "Admin" : "User"}</span>
                        </div>
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs text-muted-foreground">Đăng nhập gần nhất</p>
                          <p className="mt-1 text-sm">{formatDate(item.lastLoginAt)}</p>
                          <Button variant="outline" className="mt-3 h-11 w-full" onClick={() => setSelectedUid(item.uid)} aria-label={`Xem chi tiết ${item.email}`}>Xem chi tiết</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b text-muted-foreground">
                      <tr>
                        <th className="p-3 font-medium">Người dùng</th>
                        <th className="p-3 font-medium">Vai trò</th>
                        <th className="p-3 font-medium">Đăng nhập gần nhất</th>
                        <th className="p-3 font-medium">
                          <span className="sr-only">Thao tác</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagination.items.map((item) => (
                        <tr key={item.uid} className="border-b last:border-0">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <UserRound
                                className="size-8 shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="font-medium">
                                  {item.displayName || "Chưa có tên"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${roles[item.uid] === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {!rolesReady
                                ? "Chưa tải được"
                                : roles[item.uid] === "admin"
                                  ? "Admin"
                                  : "User"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap p-3 text-muted-foreground">
                            {formatDate(item.lastLoginAt)}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUid(item.uid)}
                              aria-label={`Xem chi tiết ${item.email}`}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  {filteredUsers.length === 0 &&
                    !errors.users &&
                    !invalidDateRange &&
                    !roleUnavailable && (
                      <p className="py-12 text-center text-muted-foreground">
                        {users.length === 0
                          ? "Chưa có hồ sơ người dùng được đồng bộ."
                          : "Không tìm thấy người dùng phù hợp."}
                      </p>
                    )}
                </div>
              )}
              {!fetching && !errors.users && (
                <TablePagination
                  {...pagination}
                  total={filteredUsers.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  disabled={Boolean(invalidDateRange || roleUnavailable)}
                />
              )}
            </CardContent>
          </Card>
          {selected && (
            <UserDetailsDialog
              user={selected}
              role={rolesReady ? roles[selected.uid] || "user" : null}
              onClose={() => setSelectedUid(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
