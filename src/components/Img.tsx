import Image from 'next/image'


export default function Img({width = 20, height = 20, ...rest}) {
  // @ts-ignore
  return <Image alt="icon" width={width} height={height} {...rest} />
}
