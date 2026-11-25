import { signal } from "@preact/signals";

export interface FollowerProfile {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  auraColor?: string;
  resonanceScore?: number;
  followedAt?: string;
}

export interface FollowersState {
  followers: FollowerProfile[];
  following: FollowerProfile[];
  followerCount: number;
  followingCount: number;
  isFollowing: Map<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

const initialState: FollowersState = {
  followers: [],
  following: [],
  followerCount: 0,
  followingCount: 0,
  isFollowing: new Map(),
  isLoading: false,
  error: null,
};

export const followersSignal = signal<FollowersState>(initialState);

// Actions
export const followUser = async (userId: string) => {
  followersSignal.value = {
    ...followersSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch(`/api/followers/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });

    if (!response.ok) throw new Error("Failed to follow user");

    const data = await response.json();

    followersSignal.value = {
      ...followersSignal.value,
      followingCount: followersSignal.value.followingCount + 1,
      isFollowing: new Map(followersSignal.value.isFollowing).set(userId, true),
      isLoading: false,
    };
  } catch (err) {
    followersSignal.value = {
      ...followersSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const unfollowUser = async (userId: string) => {
  followersSignal.value = {
    ...followersSignal.value,
    isLoading: true,
    error: null,
  };

  try {
    const response = await fetch(`/api/followers/unfollow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });

    if (!response.ok) throw new Error("Failed to unfollow user");

    followersSignal.value = {
      ...followersSignal.value,
      followingCount: Math.max(0, followersSignal.value.followingCount - 1),
      isFollowing: new Map(followersSignal.value.isFollowing).set(
        userId,
        false,
      ),
      isLoading: false,
    };
  } catch (err) {
    followersSignal.value = {
      ...followersSignal.value,
      error: err instanceof Error ? err.message : "Unknown error",
      isLoading: false,
    };
  }
};

export const checkFollowStatus = async (
  userId: string,
  targetUserId: string,
) => {
  try {
    const response = await fetch(
      `/api/followers/status?userId=${userId}&targetUserId=${targetUserId}`,
    );
    if (!response.ok) throw new Error("Failed to check follow status");

    const data = await response.json();
    followersSignal.value = {
      ...followersSignal.value,
      isFollowing: new Map(followersSignal.value.isFollowing).set(
        targetUserId,
        data.isFollowing,
      ),
    };
  } catch (err) {
    console.error("Error checking follow status:", err);
  }
};
