import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

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
        const res = await api.post(
          `/progress/${goalId}`,
          { value, notes },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return res.data;
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