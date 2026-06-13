import { useState, useCallback } from "react";
import {
  updateProfile,
  type UpdateProfilePayload,
  type User,
} from "../api/UserApi";

interface UseEditProfileReturn {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  submit: (payload: UpdateProfilePayload) => Promise<User | null>;
  reset: () => void;
}

export function useEditProfile(): UseEditProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const submit = useCallback(
    async (payload: UpdateProfilePayload): Promise<User | null> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await updateProfile(payload);
        setSuccess(res.message);
        return res.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal update profile.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, success, submit, reset };
}
