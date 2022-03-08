'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.ssr.home);
  router.post('/ssr', controller.ssr.index);
  router.get('/ssr-test', controller.ssrTest.index);

};