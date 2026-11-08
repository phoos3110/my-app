export async function withTimeout(operation, milliseconds = 15000) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error("Chưa nhận được xác nhận từ máy chủ.");
          error.code = "app/sync-timeout";
          reject(error);
        }, milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
