'usestrict';
const egg = require('egg');
module.exports = class IndexController extends egg.Controller {
  
  async index() {
    this.ctx.body = 'hi'
    // const result = this.service.article.getArtilceList();
    // await this.ctx.render('index/index.js', result);
  }
};