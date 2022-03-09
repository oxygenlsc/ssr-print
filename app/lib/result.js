// 遵照微医Spring Boot异常码约定: https://gi.guahao.cn/docbook/exception/code.html

const ERROR_MAP = {
    UNKNOWN: {
      code: '1',
      message: '未知错误',
    },
    SYS_ERROR: {
      code: 'SYS_0',
      message: '未知服务器异常',
    },
    API_ERROR: {
      code: 'SYS_1',
      message: '接口调用失败',
    },
    ILLIGAL_PARAMS: {
      code: 'C_1',
      message: '非法的调用参数',
    },
    INIT_PAGE_FAILED: {
      code: 'SYS_1',
      message: '创建PDF Page失败',
    },
    // 用户未登录,"access token参数不能为空"
    MISSING_ACCESS_TOKEN: {
      code: 'AUTH_0',
      message: '请登陆后使用打印服务',
    },
    // 登陆信息验证失败，"access token已过期"
    ACCESS_TOKEN_HAS_EXPIRED: {
      code: 'AUTH_21',
      message: '登陆过期，请重新登陆',
    },
  };
  
  module.exports = class Result {
    constructor () {
        this.code = '0'
        this.message = ''
        this.data = ''
        this.hash = ''
    }
    toString() {
      return JSON.stringify({
        code: this.code,
        message: this.message,
        data: this.data,
        hash: this.hash,
      });
    }
    setError(err, logger) {
      const DEFAULT_ERROR = ERROR_MAP.UNKNOWN;
      this.code = err.code || DEFAULT_ERROR.code;
      this.message = err.message || DEFAULT_ERROR.message;
      logger.error(`[Printer] code: ${this.code}, message: ${this.message}`);
    }
    setData(data, hash, message) {
      this.data = data;
      this.message = message;
      this.hash = hash;
      this.code = "0";
    }
  }
  