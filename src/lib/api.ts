import type { AxiosRequestConfig } from "axios";
import { api } from "@/lib/axios";
import { Gender, type Goal } from "@/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiGoal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: Goal["goalType"];
  target_value: number;
  target_unit: string;
  frequency: Goal["frequency"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ApiProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  image?: string;
};

type ProgressStatsResponse = {
  completionRate?: number;
  completion_rate?: number;
  totalDaysTracked?: number;
  total_days_tracked?: number;
  totalEntries?: number;
  total_entries?: number;
  goalBreakdown?: Record<
    string,
    {
      goalTitle?: string;
      targetValue?: number;
      targetUnit?: string;
      frequency?: string;
      averageValue?: number;
      average_value?: number;
      completionRate?: number;
      completion_rate?: number;
      currentPeriodProgress?: number;
      current_period_progress?: number;
      currentProgressPercentage?: number;
      current_progress_percentage?: number;
      remainingToTarget?: number;
      remaining_to_target?: number;
      currentPeriodStart?: string;
      current_period_start?: string;
      currentPeriodEnd?: string;
      current_period_end?: string;
    }
  >;
  goal_breakdown?: Record<
    string,
    {
      goalTitle?: string;
      targetValue?: number;
      targetUnit?: string;
      frequency?: string;
      averageValue?: number;
      average_value?: number;
      completionRate?: number;
      completion_rate?: number;
      currentPeriodProgress?: number;
      current_period_progress?: number;
      currentProgressPercentage?: number;
      current_progress_percentage?: number;
      remainingToTarget?: number;
      remaining_to_target?: number;
      currentPeriodStart?: string;
      current_period_start?: string;
      currentPeriodEnd?: string;
      current_period_end?: string;
    }
  >;
};

type ApiProgressEntry = {
  id: string;
  goal_id: string;
  date: string;
  value: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  goals?: {
    id: string;
    title: string;
    goal_type: string;
    target_value: number;
    target_unit: string;
    frequency?: string;
  };
};

type PaginatedApiResponse<T> = ApiResponse<T> & {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type Profile = ApiProfile;

export type GoalBreakdownItem = {
  goalId: string;
  goalTitle: string;
  targetValue: number;
  targetUnit: string;
  frequency: string;
  averageValue: number;
  completionRate: number;
  currentPeriodProgress: number;
  currentProgressPercentage: number;
  remainingToTarget: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

export type ProgressStats = {
  completionRate: number;
  totalDaysTracked: number;
  totalEntries: number;
  goalBreakdown: Record<string, GoalBreakdownItem>;
};

export type ProgressEntry = {
  id: string;
  goalId: string;
  date: string;
  value: number;
  notes?: string;
  createdAt: string;
  goal?: {
    id: string;
    title: string;
    goalType: string;
    targetValue: number;
    targetUnit: string;
    frequency?: string;
  };
};

export const getAuthConfig = (token: string): AxiosRequestConfig => ({
  headers: { Authorization: `Bearer ${token}` },
});

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

const mapGender = (gender: string): Gender =>
  gender?.toLowerCase() === Gender.Female ? Gender.Female : Gender.Male;

export const mapGoal = (goal: ApiGoal): Goal => ({
  id: goal.id,
  user_id: goal.user_id,
  title: goal.title,
  description: goal.description,
  goalType: goal.goal_type,
  targetValue: goal.target_value,
  targetUnit: goal.target_unit,
  frequency: goal.frequency,
  is_active: goal.is_active,
  created_at: goal.created_at,
  updated_at: goal.updated_at,
});

export const fetchProfile = async (token: string) => {
  const response = await api.get<ApiResponse<ApiProfile>>(
    "/user/profile",
    getAuthConfig(token)
  );

  const profile = unwrap(response);

  return {
    ...profile,
    gender: mapGender(profile.gender),
  };
};

export const completeProfile = async (accessToken: string) => {
  const response = await api.post<ApiResponse<ApiProfile>>(
    "/auth/complete-profile",
    { accessToken }
  );

  const profile = unwrap(response);

  return {
    ...profile,
    gender: mapGender(profile.gender),
  };
};

export const logoutRequest = async (token?: string | null) => {
  await api.post(
    "/auth/logout",
    {},
    token ? getAuthConfig(token) : undefined
  );
};

export const forgotPasswordRequest = async (email: string) => {
  const response = await api.post<ApiResponse<null>>("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const updateProfileRequest = async (
  token: string,
  payload: { firstName: string; lastName: string }
) => {
  const response = await api.put<ApiResponse<ApiProfile>>(
    "/user/update-profile",
    payload,
    getAuthConfig(token)
  );

  return response.data;
};

export const fetchGoalsRequest = async (token: string) => {
  const response = await api.get<ApiResponse<ApiGoal[]>>(
    "/goals",
    getAuthConfig(token)
  );

  return (unwrap(response) || []).map(mapGoal);
};

export const createGoalRequest = async (
  token: string,
  payload: Pick<
    Goal,
    "title" | "description" | "goalType" | "targetValue" | "targetUnit" | "frequency"
  >
) => {
  const response = await api.post<ApiResponse<ApiGoal>>(
    "/goals",
    payload,
    getAuthConfig(token)
  );

  return mapGoal(unwrap(response));
};

export const deleteGoalRequest = async (token: string, goalId: string) => {
  await api.delete(`/goals/${goalId}`, getAuthConfig(token));
};

export const logProgressRequest = async (
  token: string,
  goalId: string,
  payload: { value: number; notes?: string }
) => {
  const response = await api.post<ApiResponse<unknown>>(
    `/progress/${goalId}`,
    payload,
    getAuthConfig(token)
  );

  return unwrap(response);
};

export const fetchProgressEntriesRequest = async (
  token: string,
  params: { goalId?: string; limit?: number; page?: number; dateRange?: string }
) => {
  const response = await api.get<PaginatedApiResponse<ApiProgressEntry[]>>(
    "/progress",
    {
      ...getAuthConfig(token),
      params,
    }
  );

  return (response.data.data || []).map((entry) => ({
    id: entry.id,
    goalId: entry.goal_id,
    date: entry.date,
    value: entry.value,
    notes: entry.notes || undefined,
    createdAt: entry.created_at,
    goal: entry.goals
      ? {
          id: entry.goals.id,
          title: entry.goals.title,
          goalType: entry.goals.goal_type,
          targetValue: entry.goals.target_value,
          targetUnit: entry.goals.target_unit,
          frequency: entry.goals.frequency,
        }
      : undefined,
  }));
};

export const fetchProgressStatsRequest = async (
  token: string,
  params: { goalId?: string; period: string }
) => {
  const response = await api.get<ApiResponse<ProgressStatsResponse>>(
    "/progress/stats",
    {
      ...getAuthConfig(token),
      params,
    }
  );

  const data = unwrap(response) || {};
  const rawBreakdown = data.goalBreakdown || data.goal_breakdown || {};

  const goalBreakdown = Object.fromEntries(
    Object.entries(rawBreakdown).map(([goalId, item]) => [
      goalId,
      {
        goalId,
        goalTitle: item.goalTitle ?? "",
        targetValue: item.targetValue ?? 0,
        targetUnit: item.targetUnit ?? "",
        frequency: item.frequency ?? "",
        averageValue: item.averageValue ?? item.average_value ?? 0,
        completionRate: item.completionRate ?? item.completion_rate ?? 0,
        currentPeriodProgress:
          item.currentPeriodProgress ?? item.current_period_progress ?? 0,
        currentProgressPercentage:
          item.currentProgressPercentage ??
          item.current_progress_percentage ??
          item.completionRate ??
          item.completion_rate ??
          0,
        remainingToTarget:
          item.remainingToTarget ?? item.remaining_to_target ?? 0,
        currentPeriodStart:
          item.currentPeriodStart ?? item.current_period_start ?? "",
        currentPeriodEnd:
          item.currentPeriodEnd ?? item.current_period_end ?? "",
      },
    ])
  ) as Record<string, GoalBreakdownItem>;

  return {
    completionRate: data.completionRate ?? data.completion_rate ?? 0,
    totalDaysTracked: data.totalDaysTracked ?? data.total_days_tracked ?? 0,
    totalEntries: data.totalEntries ?? data.total_entries ?? 0,
    goalBreakdown,
  } satisfies ProgressStats;
};
