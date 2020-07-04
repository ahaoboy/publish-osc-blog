const axios = require("axios");
const fs = require("fs");
const $ = require("cheerio");
const qs = require("qs");
const vscode = require("vscode");
const yaml = require("js-yaml");

const re = /---(.*?)---/gs;

function getFrontMatter(content) {
  const s = re.exec(content)[1];
  let obj = yaml.safeLoad(s) || {};
  return obj;
}

// cookie 信息
const cookie = vscode.workspace
  .getConfiguration()
  .get("publish-osc-blog.cookie");

// 个人主页
const mainPage = vscode.workspace
  .getConfiguration()
  .get("publish-osc-blog.mainPage");

axios.interceptors.request.use(
  function (config) {
    if (config.method === "post") {
      config.data = qs.stringify(config.data);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const headers = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  cookie,
  referrer: mainPage,
};

// 将path路径中的md文件发布到osc
async function publish(path) {
  let info = await getInfo();
  const url = `${mainPage}/blog/save`;
  const CONTENT = fs.readFileSync(path, "utf8");
  let frontMatter = getFrontMatter(CONTENT);
  // 默认将第一个tag作为分类
  let catalogName = frontMatter.tag[0];
  let catalog =
    catalogName in info.catalog
      ? info.catalog[catalogName]
      : await addCatalog(catalogName, info);

  const data = {
    draft: "",
    id: "",
    user_code: info.userCode,
    title: "markdown",
    content: CONTENT,
    content_type: 3,
    catalog: catalog,

    // 默认全部发送到编程语言, 或者第一个分类, 或者可以在front matter 中自定义
    classification: "428609",
    type: 1,
    origin_url: "",
    privacy: 0,
    deny_comment: 0,
    as_top: 0,
    downloadImg: 0,
    isRecommend: 0,
  };

  let resp = await axios.post(url, data, { headers });
  //   console.log(resp.data);

  // {
  //   code: 1,
  //   message: '发表成功'
  // }
  return resp.data;
}

// 获取发布时的信息, 分类, user_code, 类别等
async function getInfo() {
  const url = `${mainPage}/blog/write`;
  let resp = await axios.get(url, { headers });
  let html = resp.data;

  // catalog classification
  let dom = $.load(html);
  let classificationDom = dom('select[name="classification"]>option');
  let classification = classificationDom.toArray().reduce((pre, now) => {
    pre[$(now).text()] = now.attribs.value;
    return pre;
  }, {});

  let catalogDom = dom('select[name="catalog"]>option');
  let catalog = catalogDom.toArray().reduce((pre, now) => {
    pre[$(now).text()] = now.attribs.value;
    return pre;
  }, {});
  let userCodeDom = dom("input[name=user_code]");
  let userCode = userCodeDom[0].attribs.value;

  let dataUserIdDom = dom('val[data-name="spaceId"]');
  let dataUserId = dataUserIdDom[0].attribs["data-value"];

  return {
    classification,
    catalog,
    userCode,
    dataUserId,
  };
}

// 添加新的分类, 返回新增加的分类id
async function addCatalog(name, info) {
  const url = `${mainPage}/blog/quick_add_blog_catalog`;
  const data = {
    space: info.dataUserId,
    userCode: info.userCode,
    user_code: info.userCode,
    name,
  };
  let resp = await axios.post(url, data, { headers });
  // 新增加的分类的id号
  return resp.data.result.id;
}

module.exports = publish;
