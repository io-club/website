declare module '*.svg' {
  import { defineComponent } from 'vue'
  export const VueComponent: ReturnType<typeof defineComponent>
  export default String
}
