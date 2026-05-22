import { signal } from "@preact/signals";

export interface CircleMember {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  joinedAt: Date;
  role: "member" | "moderator" | "founder";
  resonanceScore: number;
}

export interface CircleActivityEvent {
  id: string;
  type:
    | "new_member"
    | "new_thought"
    | "collaboration"
    | "milestone"
    | "member_left";
  actor: string;
  actorAvatar: string;
  title: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CircleMembershipState {
  memberships: Map<string, boolean>; // circleId -> isMember
  memberCounts: Map<string, number>; // circleId -> member count
  isLoading: boolean;
  error: string | null;
}

const initialState: CircleMembershipState = {
  memberships: new Map(),
  memberCounts: new Map(),
  isLoading: false,
  error: null,
};

export const circleMembershipSignal = signal<CircleMembershipState>(
  initialState
);

export const joinCircle = async (userId: string, circleId: string) => {
  circleMembershipSignal.value = {
    ...circleMembershipSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch("/api/circles/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, circleId }),
    });

    if (!response.ok) throw new Error("Failed to join circle");

    const data = await response.json();

    const newMemberships = new Map(circleMembershipSignal.value.memberships);
    newMemberships.set(circleId, true);

    const newCounts = new Map(circleMembershipSignal.value.memberCounts);
    const currentCount = newCounts.get(circleId) || 0;
    newCounts.set(circleId, currentCount + 1);

    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      memberships: newMemberships,
      memberCounts: newCounts,
      isLoading: false,
    };
  } catch (err) {
    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const leaveCircle = async (userId: string, circleId: string) => {
  circleMembershipSignal.value = {
    ...circleMembershipSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch("/api/circles/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, circleId }),
    });

    if (!response.ok) throw new Error("Failed to leave circle");

    const newMemberships = new Map(circleMembershipSignal.value.memberships);
    newMemberships.set(circleId, false);

    const newCounts = new Map(circleMembershipSignal.value.memberCounts);
    const currentCount = newCounts.get(circleId) || 0;
    newCounts.set(circleId, Math.max(0, currentCount - 1));

    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      memberships: newMemberships,
      memberCounts: newCounts,
      isLoading: false,
    };
  } catch (err) {
    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const checkCircleMembership = async (
  userId: string,
  circleId: string
) => {
  try {
    const response = await fetch(
      `/api/circles/${circleId}/membership?userId=${userId}`
    );
    if (!response.ok) throw new Error("Failed to check membership");

    const data = await response.json();
    const newMemberships = new Map(circleMembershipSignal.value.memberships);
    newMemberships.set(circleId, data.isMember);

    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      memberships: newMemberships,
    };
  } catch (err) {
    console.error("Error checking circle membership:", err);
  }
};

export const loadCircleMembers = async (circleId: string) => {
  try {
    const response = await fetch(`/api/circles/${circleId}/members`);
    if (!response.ok) throw new Error("Failed to load members");

    const data = await response.json();
    const newCounts = new Map(circleMembershipSignal.value.memberCounts);
    newCounts.set(circleId, data.members?.length || 0);

    circleMembershipSignal.value = {
      ...circleMembershipSignal.value,
      memberCounts: newCounts,
    };

    return data.members as CircleMember[];
  } catch (err) {
    console.error("Error loading circle members:", err);
    return [];
  }
};
