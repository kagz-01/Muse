import { assertEquals, assert } from "$std/testing/asserts.ts";
import {
  roomsSignal,
  addRoom,
  deleteRoom,
  resetRooms,
} from "../signals/rooms.ts";
import {
  itemsSignal,
  addItem,
  deleteItem,
  resetItems,
} from "../signals/items.ts";
import {
  threadsSignal,
  addThread,
  resetThreads,
} from "../signals/threads.ts";

// Ensure a clean baseline before each test by resetting signals
function setupFreshState() {
  resetRooms();
  resetItems();
  resetThreads();

  // create two rooms
  addRoom({ name: "Room A", description: "", themeColor: "indigo", isPublic: false, tags: [], notificationsEnabled: true });
  addRoom({ name: "Room B", description: "", themeColor: "emerald", isPublic: true, tags: [], notificationsEnabled: true });

  const r1 = roomsSignal.value[0].id;
  const r2 = roomsSignal.value[1].id;

  // add two items, one for each room
  addItem({ roomId: r1, title: "Item A1", sourceUrl: "https://example.com/a1", isPublic: false });
  addItem({ roomId: r2, title: "Item B1", sourceUrl: "https://example.com/b1", isPublic: false });

  const i1 = itemsSignal.value.find((i) => i.roomId === r1)!.id;
  const i2 = itemsSignal.value.find((i) => i.roomId === r2)!.id;

  // add a thread that references both items and both rooms
  addThread({
    title: "Thread AB",
    description: "joined",
    mood: "curious",
    itemIds: [i1, i2],
    sourceRoomIds: [r1, r2],
    isPublic: true,
    thesis: "thesis",
  });

  // add a thread that references only the r1 item/room (this one should be pruned)
  addThread({
    title: "Thread A-only",
    description: "single",
    mood: "contemplative",
    itemIds: [i1],
    sourceRoomIds: [r1],
    isPublic: false,
    thesis: "single thesis",
  });

  return { r1, r2, i1, i2 };
}

Deno.test("deleteRoom cascades items and prunes threads", () => {
  const { r1, r2: _r2, i1, i2: _i2 } = setupFreshState();

  // Sanity pre-conditions
  assert(roomsSignal.value.some((r) => r.id === r1));
  assert(itemsSignal.value.some((it) => it.id === i1 && it.roomId === r1));
  const beforeThreads = threadsSignal.value.map((t) => t.id);
  assert(beforeThreads.length >= 2);

  // Perform deletion of r1
  deleteRoom(r1);

  // Room removed
  assertEquals(roomsSignal.value.some((r) => r.id === r1), false);

  // Items belonging to r1 removed
  assertEquals(itemsSignal.value.some((it) => it.roomId === r1), false);

  // Threads should have removed references to the deleted items and room
  for (const t of threadsSignal.value) {
    assertEquals(t.sourceRoomIds.includes(r1), false);
    assertEquals(t.itemIds.includes(i1), false);
  }

  // The thread that referenced only r1 should have been pruned
  const afterThreads = threadsSignal.value.map((t) => t.id);
  assert(afterThreads.length < beforeThreads.length);
});

Deno.test("deleteItem removes references from threads", () => {
  const { r1, r2: _r2, i1, i2: _i2 } = setupFreshState();

  // Create a dedicated thread referencing i1
  addThread({
    title: "Thread for deleteItem",
    description: "test",
    mood: "curious",
    itemIds: [i1],
    sourceRoomIds: [r1],
    isPublic: false,
    thesis: "t",
  });

  const thread = threadsSignal.value.find((t) => t.itemIds.includes(i1));
  assert(thread);

  // Delete the item
  deleteItem(i1);

  // Ensure the item is removed from items store
  assertEquals(itemsSignal.value.some((it) => it.id === i1), false);

  // Ensure the thread no longer references the deleted item
  const updatedThread = threadsSignal.value.find((t) => t.id === thread!.id);
  if (updatedThread) {
    assertEquals(updatedThread.itemIds.includes(i1), false);
  }
});
