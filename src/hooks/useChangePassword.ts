import { useState, useCallback } from "react";
import { updatePassword, type UpdatePasswordPayload } from "../api/userApi";

interface UseChangePasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  submit: (payload: UpdatePasswordPayload, isOAuth?: boolean) => Promise<boolean>;
  reset: () => void;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const submit = useCallback(
    async (payload: UpdatePasswordPayload, isOAuth = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validasi current_password wajib ada kalau bukan OAuth
      if (!isOAuth && !payload.current_password?.trim()) {
        setError("Password sekarang wajib diisi.");
        setIsLoading(false);
        return false;
      }

      if (payload.new_password !== payload.new_password_confirmation) {
        setError("Konfirmasi password baru tidak cocok.");
        setIsLoading(false);
        return false;
      }

      if (payload.new_password.length < 8) {
        setError("Password baru minimal 8 karakter.");
        setIsLoading(false);
        return false;
      }

      try {
        const res = await updatePassword(payload);
        setSuccess(res.message);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengganti password.",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, success, submit, reset };
}