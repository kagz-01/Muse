import { signal } from "@preact/signals";

export interface FeedFilter {
  type: "all" | "following";
  count: number;
}

export const feedFilterSignal = signal<FeedFilter>({
  type: "all",
  count: 0,
});

export const setFeedFilter = (type: "all" | "following") => {
  feedFilterSignal.value = {
    ...feedFilterSignal.value,
    type,
  };
};

export const filterPerspectivesByFollowing = (
  perspectives: any[],
  followingIds: string[],
  filterType: "all" | "following"
) => {
  if (filterType === "all") {
    return perspectives;
  }

  return perspectives.filter((p) => followingIds.includes(p.author.id));
};
