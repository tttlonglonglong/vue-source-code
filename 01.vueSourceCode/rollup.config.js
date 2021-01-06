import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";


export default {
  input: './src/index.js', // 入口 以这个入口打包库
  output: {
    format: 'umd', // 挂载到window 模块类型 es6 commonjs
    name: 'Vue', // 全局变量的名字
    file: 'dist/umd/vue.js',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    serve({ // 打开的浏览器 端口号是3000端口
      port: 3000,
      contentBase: '', // 以哪个目录为基准
      openPage: '/index.html', // 打开的页面
    })
  ]
}