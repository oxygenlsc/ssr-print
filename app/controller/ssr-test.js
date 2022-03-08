const egg = require('egg');
const serviceInvoke = require('../lib/nacos-invoke')
const ip = require('ip')
const fs = require('fs-extra')
const path = require('path')
module.exports = class IndexController extends egg.Controller {
  
  async index() {
    const { ctx, app } = this;
    const { request } = ctx;
    const {
        tpl,
        isPdf,
        direct,
        mockfile = '',
        html,
        debug = false,
      } = request.query || {};
      // 是否直接使用custom下的mock数据
      let data;
      if (mockfile) {
        data = fs.readJsonSync(
          path.join(__dirname, `../mock/custom/${mockfile}.json`),
        );
      }else if (html) {
        data = {
          isPdf: '1',
          html: fs.readFileSync(
            path.join(__dirname, `../mock/htmls/${html}.html`),
            {
              encoding: 'utf-8',
            },
          ),
        };
      } else {
        data = {
          tpl: tpl || (debug ? '' : 'test'),
          isPdf,
          html: '',
          ip: ip.address(),
          debug: true,
        };
      }
      const finalIsPdf = mockfile && isPdf !== undefined ? isPdf : data.isPdf;
      data.isPdf = finalIsPdf;
      try {
        // 获取配置信息 ---start
        const ssrContent = await serviceInvoke(ctx, app, {
          data,
          direct: !!direct,
        });
     
        if (!data.useKano && Number(finalIsPdf) === 1) {
          let jsonData = ssrContent.data.toString('utf8');
          jsonData = html ? { data: jsonData } : JSON.parse(jsonData);
          const res = `
        <a href="javascript:downloadFile();">点击下载</a>
        <iframe src="" type="application/pdf" width="100%" height="100%" style="overflow: auto;"></iframe>
        <script>
        var pdfFileData = '${jsonData.data}';
        function createFileObj(raw) {
          var rawLength = raw.length;
          var uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          return new Blob([uInt8Array], { type: 'application/pdf' });
        }
  
        function downloadFile() {
          var linkSource = 'data:application/pdf;base64,' + pdfFileData;
          var downloadLink = document.createElement("a");
          var fileName = '测试PDF文件名.pdf';
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
  
        function viewPdf(base64Data) {
          return new Promise(function (resolve) {
            fetch('data:application/pdf;base64,' + base64Data).then(function (base64Response) {
              base64Response.blob().then(function (blob) {
                resolve(window.URL.createObjectURL(blob))
              });
            });
          });
        }
        
        viewPdf(pdfFileData).then(function (blobUrl) {
          document.querySelector("iframe").src = blobUrl;
        });
        </script>`;
          ctx.body = res;
        } else {
          ctx.body = ssrContent.data.toString('utf8');
          // ctx.body ='hi';

        }
      } catch (e) {
        // @ts-ignore
        ctx.body = e.message;
      }
  }
};