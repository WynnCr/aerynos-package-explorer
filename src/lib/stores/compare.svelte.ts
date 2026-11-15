import type { Package } from '$lib/data/types';

const MAX_COMPARE = 4;

let _items = $state<Package[]>([]);

export const compareStore = {
  get items() {
    return _items;
  },
  get count() {
    return _items.length;
  },
  get isFull() {
    return _items.length >= MAX_COMPARE;
  },

  has(name: string): boolean {
    return _items.some(p => p.name.toLowerCase() === name.toLowerCase());
  },

  add(pkg: Package): boolean {
    if (this.has(pkg.name)) return false;
    if (_items.length >= MAX_COMPARE) return false;
    _items = [..._items, pkg];
    return true;
  },

  remove(name: string) {
    _items = _items.filter(p => p.name.toLowerCase() !== name.toLowerCase());
  },

  toggle(pkg: Package) {
    if (this.has(pkg.name)) {
      this.remove(pkg.name);
    } else {
      this.add(pkg);
    }
  },

  clear() {
    _items = [];
  }
};
