import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logProgressRequest } from "@/lib/api";

export function useProgress() {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  // POST /progress/{goalId}
  const logProgress = useCallback(
    async (goalId: string, value: number, notes: string) => {
      const token = getToken()
      if (!token) return null
      
      try {
        setLoading(true);
        return await logProgressRequest(token, goalId, { value, notes });
      } catch (err) {
        console.error("Failed to log progress:", err)
        return null
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return {
    logProgress,
    loading,
  };
}
