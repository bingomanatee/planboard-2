const SvgComponent = ({ top }) => <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                       xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve"

                                       style={{
                                         fillRule: "evenodd",
                                         clipRule: "evenodd",
                                         strokeLinejoin: "round",
                                         strokeMiterlimit: 2
                                       }}>

  <circle cx={12.539} cy={12} r={12} style={{
    fill: "var(--light-grey)"
  }}/>
  <path
    d="M24.539,12C24.539,12.729 24.474,13.443 24.349,14.137L12.539,7.415L0.729,14.137C0.604,13.443 0.539,12.729 0.539,12C0.539,11.594 0.559,11.192 0.599,10.796L12.539,4L24.479,10.796C24.519,11.192 24.539,11.594 24.539,12Z"
    style={{
      fill: "currentColor"
    }}/>
  <path
    d="M23.886,15.913C23.558,16.861 23.115,17.756 22.573,18.581L12.539,12.87L2.505,18.581C1.963,17.756 1.52,16.861 1.192,15.913L12.539,9.455L23.886,15.913Z"
    style={{
      fill: "currentColor",
      fillOpacity: 0.6
    }}/>
  <path
    d="M21.481,19.999C20.779,20.783 19.975,21.475 19.09,22.053L12.539,18.324L5.988,22.053C5.103,21.475 4.299,20.783 3.597,19.999L12.539,14.909L21.481,19.999Z"
    style={{
      fill: "currentColor",
      fillOpacity: 0.3
    }}/>
  {!top ? null : (
    <path id="top-line" d="M3.598,4C5.796,1.546 8.988,-0 12.539,-0C16.09,-0 19.282,1.546 21.48,4L3.598,4Z" style={{
      fill: "currentColor"
    }}/>
  )}
</svg>;
export default SvgComponent;
