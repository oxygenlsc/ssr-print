const fs =require('fs-extra');
const path =require('path');

module.exports = function(tpls) {
  if (!tpls) {
    // 套打
    const items = fs.readdirSync(path.join(__dirname, 'items/hdw/follow'));
    const mockData = [];
    items.forEach((tpl) => {
      if (tpl.indexOf('.json') > -1) {
        const mockFilePath = path.join(__dirname, `items/hdw/follow/${tpl}`);
        const data = fs.readJsonSync(mockFilePath);
        mockData.push({
          tpl: `hdw/follow/${tpl.replace('.json', '')}`,
          data,
        });
      }
    });
    return mockData;
  }
  if (tpls.length === 1) {
    const mockFilePath = path.join(__dirname, `items/${tpls[0]}.json`);
    return {
      data: fs.existsSync(mockFilePath) ? fs.readJsonSync(mockFilePath) : {},
    };
  } else {
    const mockData = {};
    tpls.forEach(tpl => {
      const mockFilePath = path.join(__dirname, `items/${tpl}.json`);
      mockData[tpl] = fs.existsSync(mockFilePath)
        ? fs.readJsonSync(mockFilePath)
        : {};
    });
    return mockData;
  }
}
