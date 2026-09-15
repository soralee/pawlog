// Metro의 웹 번들러가 처리하는 CSS/CSS 모듈 import에 대한 타입 선언.
// (`.web.tsx` 전용 코드와 `global.css` side-effect import에 필요 — SDK 57 default 템플릿에 원래 없던 선언)
declare module '*.css' {
  const content: { readonly [className: string]: string };
  export default content;
}
