import * as React from "react";
import { SVGProps } from "react";

const MoveIcon = (props: SVGProps<SVGSVGElement>) => <svg
  width="100%"
  height="100%"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  xmlSpace="preserve"
  style={{
    fillRule: "evenodd",
    clipRule: "evenodd",
    strokeLinejoin: "round",
    strokeMiterlimit: 2
  }} {...props}>
  <g transform="matrix(1,0,0,1,-155,-397)">
    <g transform="matrix(0.666667,0,0,0.682187,212.667,216.344)">
      <rect id="fr-move-icon" x={-86.5} y={264.819} width={36} height={35.181} style={{
        fill: "none"
      }}/>
      <clipPath id="_clip1">
        <rect id="fr-move-icon1" x={-86.5} y={264.819} width={36} height={35.181}/>
      </clipPath>
      <g clipPath="url(#_clip1)">
        <g transform="matrix(2,0,0,1.9545,-398.5,-513.071)">
          <path
            d="M174,398L174,416L156,416L156,398L174,398ZM172.5,399.5L157.5,399.5L157.5,414.5L172.5,414.5L172.5,399.5Z"
            style={{
              fill: "currentcolor"
            }}/>
        </g>
        <g transform="matrix(1.74194,0,0,1.64911,-359.839,-392.075)">
          <path
            d="M175,401L175,417L159.5,417L159.5,401L175,401ZM174.139,401.889L160.361,401.889L160.361,416.111L174.139,416.111L174.139,401.889Z"
            style={{
              fill: "currentcolor",
              fillOpacity: 0.5
            }}/>
        </g>
        <g transform="matrix(1.5,0,0,1.46587,-319,-317.133)">
          <path d="M174,402L174,416L160,416L160,402L174,402ZM173,403L161,403L161,415L173,415L173,403Z" style={{
            fill: "currentcolor",
            fillOpacity: 0.25
          }}/>
        </g>
      </g>
    </g>
  </g>
</svg>;
export default MoveIcon;
