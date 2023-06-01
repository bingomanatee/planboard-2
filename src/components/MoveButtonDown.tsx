import * as React from "react"

const MoveButtonDown = ({bottom = false}) => (
  <svg
    width="25px"
    height="25px"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
  >
    <g transform="matrix(1,0,0,1,-236,-478)">
      <g transform="matrix(0.25,0,0,1.26316,191.077,-90.4211)">
        <g id="move-down-bottom1">
          <g transform="matrix(2.55578e-16,0.826087,4,-4.84756e-17,-1619,218.661)">
            <path
              d="M291,451L297,462L291,473L294,473L300,462L294,451L291,451Z"
              style={{
                fill: "currentColor",
              }}
            />
          </g>
          <g transform="matrix(2.55578e-16,0.826087,4,-4.84756e-17,-1619,214.531)">
            <path
              d="M291,451L297,462L291,473L294,473L300,462L294,451L291,451Z"
              style={{
                fill: "currentColor",
                fillOpacity: 0.6,
              }}
            />
          </g>
          <g transform="matrix(2.55578e-16,0.826087,4,-4.84756e-17,-1619,210.4)">
            <path
              d="M291,451L297,462L291,473L294,473L300,462L294,451L291,451Z"
              style={{
                fill: "currentColor",
                fillOpacity: 0.3,
              }}
            />
          </g>
          <g transform="matrix(4,0,0,-0.659722,-659,784.146)">
            {bottom ?    <rect
              x={211}
              y={479}
              width={22}
              height={3}
              style={{
                fill: "currentColor",
              }}
            /> : null}

          </g>
        </g>
      </g>
    </g>
  </svg>
)
export default MoveButtonDown
