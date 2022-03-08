'use strict';
const path = require('path');
const fs = require('fs');
module.exports = app => {
  const exports = {};

  // exports.siteFile = {
  //   '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/asset/images/favicon.ico'))
  // };
  const servicePort = 9763;
  exports.cluster = {
    listen: {
      path: '',
      port: servicePort,
      hostname: '0.0.0.0',
    },
  };
  // @TODO 后续需要传递csrf，暂时先关闭安全校验
  exports.vuessr = {
    layout: path.join(app.baseDir, 'app/web/view/layout.html'),
    injectJs: false,
      // 替换css为内联style
    injectCss: true,
    renderOptions: {
      template:
      '<!DOCTYPE html><html lang="en"><head><title>打印服务</title></head><body><!--vue-ssr-outlet--></body></html>',
    },
    // injectRes:[
    //   {
    //     url: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.0.2/css/swiper.min.css'
    //   },
    //   {
    //     url: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.0.2/js/swiper.min.js'
    //   }
    // ]
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(app.baseDir, 'logs')
  };

  exports.static = {
    prefix: '/public/',
    dir: path.join(app.baseDir, 'public')
  };

  exports.keys = '123456';

  exports.middleware = [
    'locals',
    'access'
  ];

  exports.security = {
    csrf: {
      enable: false,
    },
    xframe: {
      enable: false,
    },
  };

  return exports;
};