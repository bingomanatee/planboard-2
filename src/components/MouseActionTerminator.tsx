
const terminate = (e) => {
  e.stopPropagation();
}
export default function MouseActionTerminator({children}) {
  return (<div onMouseDown={terminate} onClick={terminate} onMouseUp={terminate}>
    {children}
  </div>);
}
