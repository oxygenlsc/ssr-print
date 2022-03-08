// vue-entry-loader 自定义全局注册钩子，如果在该目录下面存在该 template.js 框架自动加载，用于注册全局的组件
export default function (Vue) {
  Vue.component('Layout', {
    template: `<div>
      <slot></slot>
    </div>`,
  });
}