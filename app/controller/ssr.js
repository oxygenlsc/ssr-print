'usestrict';
const egg = require('egg');
module.exports = class IndexController extends egg.Controller {
  
  async index() {
    console.log(this.ctx.service.ssr.index,'this.ctx.service.ssr.index')
    return this.ctx.service.ssr.index();
  }
  async home() {
    this.ctx.body = 'hello world'
  }
};