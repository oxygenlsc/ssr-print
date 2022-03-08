'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.ssr.index);
};