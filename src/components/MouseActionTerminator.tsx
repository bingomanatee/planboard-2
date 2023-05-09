import { terminate } from '~/lib/utils'

export default function MouseActionTerminator({children}) {
  return (<span onMouseDown={terminate} onClick={terminate} onMouseUp={terminate}>
    {children}
  </span>);
}
