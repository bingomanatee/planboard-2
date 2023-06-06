import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Link } from '~/types'

export type EditLinkStateValue = Link & {};

type leafType = typedLeaf<EditLinkStateValue>;

const fromJsonString = (str) => {
  if (!(str && typeof str === 'string')) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function linkDetailFactory(detailString) {
  let info = fromJsonString(detailString);
  return (
    {
      $value: {
        label: '',
        mode: '',
        x: 0,
        y: 0,
        lat: 0,
        lon: 0,
        ...info
      }
    }
  )
}

function styleFactory(styleString) {
  let info = fromJsonString(styleString);

  return {
    $value: {
      width: 2,
      color: 'black',
      mode: 'straight',
      ...info
    }
  }
}

const EditLinkState = (props: {id: string}, dataStore: leafI) => {

  const linkData = dataStore.child('links')!.value.get(props.id)?.content || {};

  const $value: EditLinkStateValue = {
    id: props.id,
    style: '',
    from_frame_id: '',
    to_frame_id: '',
  ...linkData
  };
  return {
    name: "EditLink",
    $value,

    selectors: {},

    actions: {},

    children: {
      style: styleFactory(linkData.style),
      from_detail: linkDetailFactory(linkData.from_detail),
      to_detail: linkDetailFactory(linkData.to_detail),
    }
  };
};

export default EditLinkState;
