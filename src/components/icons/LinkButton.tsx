const LinkButton = () => <svg width="25" height="25" viewBox="0 0 25 25"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                fillRule: "evenodd",
                                clipRule: "evenodd",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                              }}>
  <path d="M3.625,11.625L21,16.625" style={{
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }}/>
  <rect id="from-anchor" x={0.625} y={8.625} width={6} height={6} style={{ fill: "#b280be" }}/>
  <rect id="to-anchor" x={17} y={12.625} width={7.625} height={8} style={{ fill: "#b280be" }}/>
</svg>;
export default LinkButton;
