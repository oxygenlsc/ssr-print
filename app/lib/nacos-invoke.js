const { address } = require('ip');

module.exports = async (ctx, app, options = {}) => {
    const {
      api = '/ssr',
      data,
      method = 'POST',
      contentType = 'json',
      timeout = 90000,
    } = options;
    // const realServer =
    //   (direct || !ENABLE_MICRO_SERVICE)
    //     ? '127.0.0.1:9763'
    //     : getRealServer(app.config.nacosProviders[appName]);
    const realServer = '127.0.0.1:9763'
  
  
    let curlBaseOption = {
      method,
      timeout,
      data,
    };
    curlBaseOption = {
        ...curlBaseOption,
        contentType,
      };
    console.log(curlBaseOption,'curlBaseOption',ctx.request.search)
    const content = await ctx.curl(
      `${realServer}${api}${ctx.request.search}`,
      curlBaseOption,
    );
    // console.log(content.data.toString('utf8'),'content')

    return content ;
  };