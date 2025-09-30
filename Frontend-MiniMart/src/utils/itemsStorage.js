// // Simple localStorage-backed CRUD for items

// const STORAGE_KEY = "app.items";

// export function getItems() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch (e) {
//     return [];
//   }
// }

// export function saveItems(items) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
// }

// export function seedItemsIfEmpty(seed = []) {
//   const current = getItems();
//   if (!current || current.length === 0) {
//     saveItems(seed);
//     return seed;
//   }
//   return current;
// }

// export function addItem(item) {
//   const items = getItems();
//   const nextId =
//     items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
//   const toSave = { ...item, id: nextId };
//   const updated = [...items, toSave];
//   saveItems(updated);
//   return toSave;
// }

// export function updateItem(id, partial) {
//   const items = getItems();
//   const updated = items.map((it) =>
//     it.id === id ? { ...it, ...partial, id } : it
//   );
//   saveItems(updated);
//   return updated.find((it) => it.id === id) || null;
// }

// export function deleteItem(id) {
//   const items = getItems();
//   const updated = items.filter((it) => it.id !== id);
//   saveItems(updated);
//   return updated;
// }

// export function findItem(id) {
//   const items = getItems();
//   return items.find((it) => it.id === id) || null;
// }
