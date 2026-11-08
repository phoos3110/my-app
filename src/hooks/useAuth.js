import { useEffect, useRef, useState } from "react";
import {
  watchAuthState,
  loginWithGoogle,
  logout,
} from "@/services/authService";
import { watchUserRole } from "@/services/roleService";
import { syncUserProfile } from "@/services/userService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [toast, setToast] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const toastId = useRef(0);
  const actionPending = useRef(false);
  const currentUid = useRef(null);

  useEffect(() => {
    let revision = 0;
    let unsubscribeRole = () => {};
    const unsubscribeAuth = watchAuthState(
      (currentUser) => {
        const currentRevision = ++revision;
        unsubscribeRole();
        unsubscribeRole = () => {};
        currentUid.current = currentUser?.uid || null;
        setUser(currentUser);
        setRole(null);
        setError("");
        if (!currentUser) setProfileError("");
        setChecking(Boolean(currentUser));
        if (!currentUser) return;
        unsubscribeRole = watchUserRole(
          currentUser.uid,
          (nextRole) => {
            if (currentRevision !== revision) return;
            setRole(nextRole);
            setChecking(nextRole === null);
            setError("");
          },
          (err) => {
            if (currentRevision !== revision) return;
            setRole(null);
            setChecking(false);
            setError(
              `Không thể đọc quyền tài khoản. Hãy thử lại. (${err.code})`,
            );
          },
        );
      },
      (err) => {
        revision++;
        unsubscribeRole();
        currentUid.current = null;
        setUser(null);
        setRole(null);
        setError(`Không thể kiểm tra phiên đăng nhập. (${err.code})`);
        setChecking(false);
      },
    );
    return () => {
      revision++;
      unsubscribeRole();
      unsubscribeAuth();
    };
  }, [retryKey]);

  function notify(message, type = "success") {
    setToast({ id: ++toastId.current, message, type });
  }

  async function saveProfile(account) {
    setProfileError("");
    try {
      await syncUserProfile(account);
    } catch (err) {
      if (currentUid.current === account.uid) {
        setProfileError(
          err.code === "app/sync-timeout"
            ? "Bạn đã đăng nhập nhưng Firestore chưa xác nhận lưu hồ sơ. Kiểm tra mạng và tiện ích chặn quảng cáo cho localhost, rồi thử lại. Yêu cầu có thể vẫn được lưu khi kết nối trở lại."
            : `Bạn đã đăng nhập, nhưng chưa lưu được hồ sơ người dùng. (${err.code})`,
        );
      }
    }
  }

  async function handleLogin() {
    if (actionPending.current) return;
    actionPending.current = true;
    setLoading(true);
    setToast(null);
    try {
      const result = await loginWithGoogle();
      notify("Đăng nhập thành công.");
      // Đồng bộ Firestore không được giữ nút đăng xuất ở trạng thái chờ.
      void saveProfile(result.user);
    } catch (err) {
      if (
        !["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(
          err.code,
        )
      ) {
        notify(
          err.code === "auth/popup-blocked"
            ? "Trình duyệt chặn cửa sổ Google. Hãy cho phép popup rồi thử lại."
            : `Không thể đăng nhập. Vui lòng thử lại. (${err.code})`,
          "error",
        );
      }
    } finally {
      actionPending.current = false;
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (actionPending.current) return;
    actionPending.current = true;
    setLoading(true);
    try {
      await logout();
      setProfileError("");
      notify("Đã đăng xuất.");
    } catch (err) {
      notify(`Không thể đăng xuất. Vui lòng thử lại. (${err.code})`, "error");
    } finally {
      actionPending.current = false;
      setLoading(false);
    }
  }

  async function retryProfile() {
    if (!user || actionPending.current) return;
    actionPending.current = true;
    setLoading(true);
    try {
      await saveProfile(user);
    } finally {
      actionPending.current = false;
      setLoading(false);
    }
  }

  return {
    user,
    role,
    checking,
    loading,
    error,
    profileError,
    toast,
    retryAuth: () => setRetryKey((key) => key + 1),
    retryProfile,
    loginWithGoogle: handleLogin,
    logout: handleLogout,
  };
}
