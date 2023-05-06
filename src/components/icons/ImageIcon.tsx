import * as React from "react"
const ImageIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    viewBox="0 0 32 33"
  >
    <g transform="matrix(.88889 0 0 .90958 76.889 -240.605)">
      <path
        d="M-86.5 264.819h36V300h-36z"
        style={{
          fill: "none",
        }}
      />
      <clipPath id="a">
        <path d="M-86.5 264.819h36V300h-36z" />
      </clipPath>
      <g clipPath="url(#a)">
        <g transform="matrix(1.16129 0 0 1.13487 -109.726 -128.981)">
          <path
            d="M35.5 347c8.555 0 15.5 6.945 15.5 15.5S44.055 378 35.5 378 20 371.055 20 362.5 26.945 347 35.5 347Zm0 3.875c-6.416 0-11.625 5.209-11.625 11.625s5.209 11.625 11.625 11.625 11.625-5.209 11.625-11.625-5.209-11.625-11.625-11.625Z"
            style={{
              fill: "#fff",
            }}
          />
          <circle
            cx={35.5}
            cy={362.5}
            r={15.5}
            style={{
              fill: "#3e3e3e",
            }}
          />
        </g>
        <g transform="matrix(1.2375 0 0 1.20935 -194.725 -62.254)">
          <path
            d="M92 275h20v20H92z"
            style={{
              fill: "none",
            }}
          />
          <clipPath id="b">
            <path d="M92 275h20v20H92z" />
          </clipPath>
          <g clipPath="url(#b)">
            <path
              d="m89 287 8.41-8.41 5.829 5.829 3.316-3.316 7.023 7.024L114 300l-25-1v-12Z"
              style={{
                fill: "currentColor",
              }}
            />
          </g>
          <path
            d="M112 275v20H92v-20h20Zm-.909.909H92.909v18.182h18.182v-18.182Z"
            style={{
              fill: "currentColor",
            }}
          />
        </g>
      </g>
    </g>
  </svg>
)
export default ImageIcon
