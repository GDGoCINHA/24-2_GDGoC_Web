declare module 'type-hangul/src' {
  interface TypeHangulOptions {
    text: string
    speed?: number
    intervalType?: number
    humanize?: number
  }

  interface TypeHangulApi {
    type: (selector: string, options: TypeHangulOptions) => void
  }

  const TypeHangul: TypeHangulApi
  export default TypeHangul
}
