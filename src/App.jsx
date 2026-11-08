import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import AccountPage from "@/pages/AccountPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ActionToast from "@/components/ActionToast";

export default function App() {
  const {
    user,
    role,
    checking,
    loading,
    error,
    profileError,
    toast,
    retryAuth,
    retryProfile,
    loginWithGoogle,
    logout,
  } = useAuth();

  if (checking) {
    return (
      <div
        className="grid min-h-dvh place-items-center"
        role="status"
        aria-label="Đang kiểm tra đăng nhập"
      >
        <Spinner className="size-11 text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      {(error || profileError) && (
        <div className="space-y-3 p-4">
          {[
            [error, retryAuth],
            [profileError, retryProfile],
          ].map(
            ([message, retry], index) =>
              message && (
                <Alert key={index} variant="destructive">
                  <AlertTitle>
                    {index === 0
                      ? "Không thể kiểm tra quyền"
                      : "Chưa đồng bộ hồ sơ"}
                  </AlertTitle>
                  <AlertDescription>
                    <p>{message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retry}
                      disabled={loading}
                    >
                      Thử lại
                    </Button>
                  </AlertDescription>
                </Alert>
              ),
          )}
        </div>
      )}
      {user && role === "admin" ? (
        <AdminDashboard user={user} onLogout={logout} loading={loading} />
      ) : user ? (
        <AccountPage onLogout={logout} loading={loading} />
      ) : (
        <LoginPage onGoogleLogin={loginWithGoogle} loading={loading} />
      )}
      {toast && (
        <ActionToast key={toast.id} message={toast.message} type={toast.type} />
      )}
    </>
  );
}
