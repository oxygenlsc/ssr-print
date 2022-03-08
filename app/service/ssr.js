
const {Service} = require('egg');
const mockData = require('../mock');
const { getFinalContent } = require('../lib/utils') ;

// const Result = require('../lib/result');
module.exports = class SSR extends Service {
    async index() {
      const startTime = Date.now();
      // @ts-ignore
      const { ctx } = this;
      const { request, service, app } = ctx;
      const { body: reqBody, query } = request;
      const { tpl = query.tpl, html, debug = query.debug } = reqBody;
      console.log(tpl,'tpltpltpl',request);
     
      let result;
      if (tpl) {
        // 早期的API，使用tpl方式
        const tpls = tpl.split(',');
        tpls.forEach((tplName, index) => {
          tpls[index] = tpls[index];
        });
        const mock = debug ? mockData(tpls) : {};
        const queryData = debug ? mock.data || mock : reqBody.data;
        result = await service.ssr.render(tpls, queryData);
      } else if (html) {
        result = await service.ssr.htmlToPdf(html);
      } else {
        const queryData = reqBody.data || (debug ? mockData() : {});
        result = await service.ssr.batchRender(
          Array.isArray(queryData) ? queryData : [queryData],
        );
      }
      app.coreLogger.info(
        `total cost for this request: ${Date.now() - startTime}`,
      );
    }
    /**
     * 获取模板内容, render函数为了兼容老版本桌面App的格式，后续的都是走下面的 batchRender方法
     */
     async render(tpls, queryData) {
      const { ctx } = this;
      const { request } = ctx;
      const { body: reqBody, query, headers } = request;
      const { api, isPdf, siteData = {}, isSingle, pageSettings = {} } = reqBody;
    //   const result = new Result();
      // 当参数isPdf参数为1时表示打印pdf   1: 打印pdf   其他: 不打印
      const needPdf = Number(isPdf) === 1;
      // 是否是API调用，如果是API调用，需要返回json格式；
      const isApiCall = needPdf || Number(api);
      const items = [];
      const isSinglePrint = isSingle || tpls.length === 1;
      for (const tpl of tpls) {
        await ctx.render(`${tpl.trim()}/index.js`, {
          data: isSinglePrint ? queryData : queryData[tpl],
          req: {
            query,
            siteData,
            headers: {
              'content-type': headers['content-type'],
              'content-length': headers['content-length'],
              'user-agent': headers['user-agent'],
              host: headers['host'],
            },
          },
        });
        items.push(ctx.body);
      }
      let ret;
      if (needPdf) {
        ret = await getFinalPdf(
          [
            {
              items,
              pageSettings,
            },
          ],
          ctx,
        );
      } else {
        ret = await getFinalContent(
          [
            {
              items,
            },
          ],
          ctx,
        );
      }
  
      const { error, data: content, hash } = ret;
      if (error) {
        // result.setError(error, ctx.logger);
      } else {
        // result.setData(content, hash);
      }
      console.log(content,'content')
      // ctx.body = isApiCall ? result : content;
      ctx.body =  content;
      return content;
    }
  
     async htmlToPdf(html) {
      const { ctx } = this;
      const { request } = ctx;
      const { body: reqBody } = request;
      const { pageSettings = {} } = reqBody;
      
    //   let result = new Result();
      const { error, data: content, hash } = await getFinalPdf(
        [
          {
            items: [removeScriptTags(html)],
            pageSettings,
          },
        ],
        ctx,
      );
      if (error) {
        // result.setError(error, ctx.logger);
      } else {
        // result.setData(content, hash);
        ctx.body = content;
      }
      return result;
    }
  
    // 批量打印模式，每条数据根据资深模板渲染
     async batchRender(queryData) {
      const { ctx } = this;
      const { request } = ctx;
      const { body: reqBody, query, headers } = request;
      const { api, isPdf, siteData = {}, pageSettings = {} } = reqBody;
    //   const result = new Result();
      // 当参数isPdf参数为1时表示打印pdf   1: 打印pdf   其他: 不打印
      const needPdf = Number(isPdf) === 1;
      // 是否是API调用，如果是API调用，需要返回json格式；
      const isApiCall = needPdf || Number(api);
      // 如果内部有“innerPageSettings”,需要进行分组
  
      const pageHtmls = [];
      let currentPageSettings = pageSettings;
      let oldPageSettings;
      let currentGroup = {
        pageSettings: currentPageSettings,
        items: [],
      };
      for (const item of queryData) {
        const { tpl, data, html, pageSettings: innerPageSettings } = item;
        currentPageSettings = innerPageSettings || pageSettings;
        // 没有设置 pageSettings，或者pageSettings有变化，都要新增一个分组
        if (oldPageSettings !== currentPageSettings) {
          currentGroup = {
            pageSettings: currentPageSettings,
            items: [],
          };
          pageHtmls.push(currentGroup);
          oldPageSettings = currentPageSettings;
        }
        if (html) {
          currentGroup.items.push(removeScriptTags(html));
        } else {
          await ctx.render(`${tpl.trim()}/index.js`, {
            data,
            req: {
              query,
              siteData,
              headers: {
                'content-type': headers['content-type'],
                'content-length': headers['content-length'],
                'user-agent': headers['user-agent'],
                host: headers['host'],
              },
            },
          });
          currentGroup.items.push(ctx.body);
        }
      }
      let ret;
      if (needPdf) {
        ret = await getFinalPdf(pageHtmls, ctx);
      } else {
        ret = await getFinalContent(pageHtmls, ctx);
      }
  
      const { error, data: content, hash } = ret;
      if (error) {
        // result.setError(error, ctx.logger);
      } else {
        // result.setData(content, hash);
      }
      ctx.body = isApiCall ? result : content;
      return result;
    }
  }