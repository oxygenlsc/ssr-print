'use strict';
const fs = require('fs-extra');
// Webpack：https://www.yuque.com/easy-team/easywebpack
// Egg Vue: https://www.yuque.com/easy-team/egg-vue
// 生成入口文件 --start
const entries = {};


let tplPath;
let routePath;
let tplDirPath;
// 这些文件夹不用生成模板入口
let ignorePaths = ['common', 'hdw/images', 'hdw/follow/component', 'hdw/health-exam/components'];
const rootTplsDir = 'app/templates';
function initEntries(dir, parentRoute) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    if (file.isFile()) {
      return;
    }
    const tplName = file.name;
    // 当前文件夹相对路径
    tplDirPath = parentRoute ? `${parentRoute}/${tplName}` : `${tplName}`;
    if (ignorePaths.includes(tplDirPath)) {
      return;
    }
    // 当前模板路由
    routePath = `${tplDirPath}/index`;
    // 模板文件相对路径
    tplPath = `${rootTplsDir}/${routePath}.vue`;
    if (!entries[routePath] && fs.existsSync(tplPath)) {
      entries[routePath] = tplPath;
    }
    initEntries(`${rootTplsDir}/${tplDirPath}`, tplDirPath);
  });
}

initEntries(rootTplsDir, '');

// 生成入口文件 --end

module.exports = {
  entry: entries,
  loaders: {
    typescript: true,
  },
  port: 9002,
  plugins: [
    {
      imagemini: false,
    },
    {
      extract: false,
    },
  ],
  module: {
    rules: [
      {
        less: true,
      },
      {
        test: /\.(png|jpg|gif|ttf|TTF)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
            },
          },
        ],
      }
    ],
  },
  alias: {
    templates: 'app/templates',
  }
};
