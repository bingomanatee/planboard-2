import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'


function GlobalFactory(dataStore: leafI) {
  return new Forest({
    $value: {
        user: null,
    }

  });
}

export default GlobalFactory;
