const SvgComponent = ({
  bottom
                      }) => <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{
  fillRule: "evenodd",
  clipRule: "evenodd",
  strokeLinejoin: "round",
  strokeMiterlimit: 2
}}>
  <circle cx={12.348} cy={12} r={12} style={{
    fill: "var(--light-grey)"
  }}/>
  <path
    d="M0.348,12C0.348,11.271 0.413,10.557 0.538,9.863L12.348,16.585L24.158,9.863C24.283,10.557 24.348,11.271 24.348,12C24.348,12.406 24.328,12.808 24.288,13.204L12.348,20L0.408,13.204C0.368,12.808 0.348,12.406 0.348,12Z"
    style={{
      fill: "currentColor"
    }}/>
  <path
    d="M1.002,8.087C1.329,7.139 1.772,6.244 2.314,5.419L12.348,11.13L22.382,5.419C22.924,6.244 23.367,7.139 23.695,8.087L12.348,14.545L1.002,8.087Z"
    style={{
      fill: "currentColor",
      fillOpacity: 0.6
    }}/>
  <path
    d="M3.406,4.001C4.108,3.217 4.912,2.525 5.797,1.947L12.348,5.676L18.9,1.947C19.784,2.525 20.588,3.217 21.291,4.001L12.348,9.091L3.406,4.001Z"
    style={{
      fill: "currentColor",
      fillOpacity: 0.3
    }}/>
  {!bottom ? null : <path id="top-line" d="M21.289,20C19.092,22.454 15.899,24 12.348,24C8.797,24 5.605,22.454 3.407,20L21.289,20Z"
        style={{
          fill: "currentColor"
        }}/>}
</svg>;
export default SvgComponent;
