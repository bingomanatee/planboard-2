import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'


function GlobalFactory(dataStore: leafI) {
  return new Forest({
    $value: {
        user: null,
        menuItems: [],
    },
    selectors: {
      menuItems(store: leafI) {
        return store.value.menuItems;
      }
    },
    actions: {
      clearMenuItems(store: leafI) {
        store.do.set_menuItems([]);
      },
      addMenuItems(store: leafI, ...items) {
        store.do.set_menuItems(
         [...store.value.menuItems, ...items.flat()]
        )
      }
    }
  });
}

export default GlobalFactory;
