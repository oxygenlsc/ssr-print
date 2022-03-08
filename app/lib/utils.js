const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const path = require('path')
const { Browser } = require('puppeteer') ;
// const { ERROR_MAP } from './result';
const { PDFDocument } = require('pdf-lib') ;// HTML字符串数据清洗（比如：需要加载图表等）
const md5 = require('md5')
let puppeteerBrowser;
const pageStyle = fs
  .readFileSync(path.join(__dirname, '../snippets/page.css'))
  .toString('utf-8');
const headReg = /<head>([\s\S]*?)<\/head>/;
const bodyReg = /<body([\s\S]*?)>([\s\S]*)<\/body>/;
async function getPuppeteerBrowser() {
  if (!puppeteerBrowser) {
    puppeteerBrowser = await puppeteer.launch({
      args: [
        '-disable-dev-shm-usage',
        '-no-sandbox',
        '--font-render-hinting=none',
        '-disable-setuid-sandbox',
        '-no-first-run',
        '-disable-gpu',
        '-no-zygote',
        '-single-process',
      ],
    });
  }
  return puppeteerBrowser;
}
// 准备网页数据
async function prepareContent(page, { items }, isPdf, ctx) {
    let htmlContent;
    // 单页数据，直接吐出去，多页的话，需要合并。
    if (items.length === 1) {
      htmlContent = items[0];
    } else {
      let htmls = ['<html>'];
      const heads = ['<head>'];
      const bodys = ['<body>'];
      let headContent
      let bodyContent
      items.forEach((html) => {
        headContent = html.match(headReg);
        bodyContent = html.match(bodyReg);
        headContent && heads.push(headContent[1]);
        if (bodyContent) {
          bodyContent[1] && bodys.push(`<div${bodyContent[1]}>`);
          bodys.push(bodyContent[2]);
          bodyContent[1] && bodys.push('</div>');
        }
      });
      bodys.push('</body>');
      heads.push('</head>');
      htmls = htmls.concat(heads);
      htmls = htmls.concat(bodys);
      htmls.push('</html>');
      htmlContent = htmls.join('');
    }
    const { app, request } = ctx;
    const port = app.config.cluster?.listen?.port || '9763';
    // 使用Puppeteer的时候，不识别相对路径。
    htmlContent = htmlContent.replace(
      /\/public\//gi,
      `${request.origin}/public/`,
    );
  
    /* 如果是本地生成PDF，需要加载字体
     */
    isPdf &&
      (htmlContent = htmlContent.replace(
        '<head>',
        `<head><style>${pageStyle}</style>`,
      ));
  
    htmlContent = htmlContent.replace(
      /\/public\//gi,
      `${request.origin}/public/`,
    );
  
    await page.setContent(htmlContent);
  
    //@TODO 待优化 这里加载字体需要耗费约50ms
    const handle = await page.evaluateHandle('document.fonts.ready');
    const asyncImgs = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img.async-img');
      const items = [];
      let imgId;
      for (let i = 0; i < imgs.length; i++) {
        imgId = imgs[i].getAttribute('id');
        if (!imgId) {
          imgId = `async-img-${i}`;
          imgs[i].setAttribute('id', imgId);
        }
        items.push({
          //@ts-ignore
          id: imgId,
          //@ts-ignore
          api: imgs[i].getAttribute('data-api'),
          //@ts-ignore
          data: JSON.parse(imgs[i].getAttribute('data-query-data')),
        });
        imgs[i].removeAttribute('data-query-data');
      }
      return items;
    });
    // 如果有图片数据需要加载（如：图表、心电图），则统一处理
    if (asyncImgs.length) {
      await loadAsyncImgs({
        asyncImgs,
        page,
        ctx,
        host: `http://localhost:${port}`,
      });
    }
    handle.dispose();
  }
async function getFinalContent(groups, ctx) {
  const startTime = Date.now();
  try {
    let items = [];
    groups.forEach(({ items: inner }) => {
      items = items.concat(inner);
    });
    const browser = await getPuppeteerBrowser();
    if (!browser) {
      throw 'initial puppeteer browser failed.';
    }
    const page = await browser.newPage();
    await prepareContent(page, { items }, false, ctx);

    // @TODO 输出html的时候，字体文件需要过滤掉
    let content = await page.content();
    console.log(content)
    // 过滤掉js代码，因为不需要客户端二次渲染
    content = content.replace(/<script.*?>.*?<\/script>/gi, '');
    page.close();
    ctx.logger.info(`get final html content, cost: ${Date.now() - startTime}`);
    return {
      hash: md5(items.join('')),
      data: content,
    };
  } catch (err) {
    // const error = ERROR_MAP.INIT_PAGE_FAILED;
    // // @ts-ignore
    // error.message = err.stack;
    ctx.logger.error(
      `[Pdf Render]get final html content failed: ${JSON.stringify(err)}`,
    );
    return {
      error: err,
    };
  }
}
module.exports = {
    getFinalContent
}