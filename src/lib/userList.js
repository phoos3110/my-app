const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export function filterUsers(
  users,
  roles,
  { search = "", role = "all", sort = "latest", from = "", to = "" },
) {
  const term = normalize(search.trim());
  const start = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const end = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
  const timestamp = (item) => item.lastLoginAt?.toMillis?.() ?? null;
  return users
    .filter((item) => {
      const matchesSearch = [item.displayName, item.email, item.uid].some(
        (value) => normalize(value).includes(term),
      );
      const actualRole = roles[item.uid] === "admin" ? "admin" : "user";
      const time = timestamp(item);
      return (
        matchesSearch &&
        (role === "all" || actualRole === role) &&
        ((!from && !to) || (time !== null && time >= start && time <= end))
      );
    })
    .sort((a, b) => {
      const tie = a.uid.localeCompare(b.uid);
      if (sort === "name-asc" || sort === "name-desc") {
        const comparison = String(a.displayName || a.email || "").localeCompare(
          String(b.displayName || b.email || ""),
          "vi",
        );
        return (sort === "name-desc" ? -comparison : comparison) || tie;
      }
      const first = timestamp(a);
      const second = timestamp(b);
      if (first === null && second !== null) return 1;
      if (second === null && first !== null) return -1;
      return (
        (sort === "oldest"
          ? (first ?? 0) - (second ?? 0)
          : (second ?? 0) - (first ?? 0)) || tie
      );
    });
}

export function paginateUsers(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    first: items.length ? start + 1 : 0,
    last: Math.min(start + pageSize, items.length),
  };
}
