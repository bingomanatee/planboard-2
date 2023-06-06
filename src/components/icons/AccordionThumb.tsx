const AccordionThumb = ({ up, onClick }) => <svg width="24" height="24" viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                        xmlSpace="preserve"
                                                 onClick={onClick}
                                                 style={{
  fillRule: "evenodd",
  clipRule: "evenodd",
  strokeLinejoin: "round",
  strokeMiterlimit: 2
}}>
  {up ? (<path id="thumb-up-path"
               d="M9.097,1.328L22.097,9.854C22.646,10.214 22.983,10.821 22.999,11.477C23.016,12.133 22.709,12.756 22.178,13.143L9.178,22.616C8.57,23.06 7.764,23.124 7.093,22.783C6.422,22.441 6,21.753 6,21L6,3C6,2.265 6.403,1.589 7.05,1.24C7.696,0.891 8.482,0.925 9.097,1.328ZM8,3L8,21L21,11.526L8,3Z"
               style={{
                 fill: "#0419a7",
                 fillOpacity: 0.5
               }}/>) : null}
  {up ? (<path id="thumb-up-fill" d="M8,3L21,11.526L8,21L8,3Z" style={{
    fill: "#fff"
  }}/>) : null}
  {!up ? (
    <path id="thumb-down-fill" d="M21,5.5L12.474,18.5L3,5.5L21,5.5Z"/>
  ) : null}
  {!up ? (
    <path id="thumb-down-path"
          d="M22.672,6.597L14.146,19.597C13.786,20.146 13.179,20.483 12.523,20.499C11.867,20.516 11.244,20.209 10.857,19.678L1.384,6.678C0.94,6.07 0.876,5.264 1.217,4.593C1.559,3.922 2.247,3.5 3,3.5L21,3.5C21.735,3.5 22.411,3.903 22.76,4.55C23.109,5.196 23.075,5.982 22.672,6.597ZM21,5.5L3,5.5L12.474,18.5L21,5.5Z"
          style={{
            fill: "#0419a7"
          }}/>
  ) : null}
</svg>;
export default AccordionThumb;
