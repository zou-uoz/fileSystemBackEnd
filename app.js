const { readdir } = require('node:fs/promises');
const { rename } = require('node:fs/promises');
const { rm } = require('node:fs/promises');
const { cp } = require('node:fs/promises');
const Koa = require('koa');
const route = require('koa-route');
const path = require('path');
const serve = require('koa-static');
const { koaBody } = require('koa-body');

const staticPath = path.join(__dirname, 'public');
const app = new Koa();

const main = serve(staticPath);

const dirents = async ctx => {
    const body = ctx.request.body;
    ctx.response.type = 'json';
    const dirents = await readdir(staticPath + body.path, { withFileTypes: true });
    const prefix = 'http://localhost:5000';
    const response = {
        dirents: dirents.map(d => ({
            url: prefix + body.path + '/' + d.name,
            isDirectory: d.isDirectory(),
        })),
        code: 0,
        msg: '获取成功',
    }
    ctx.response.body = response;
};

const cut = async ctx => {
    const { clipboard, targetFolder } = ctx.request.body;
    ctx.response.type = 'json';
    const renamePromises = clipboard.map(c => rename(staticPath + c, staticPath + targetFolder + '/' + c.split('/').pop()))
    for (const renamePromise of renamePromises) {
        await renamePromise
    }
    const prefix = 'http://localhost:5000';
    ctx.response.body = {
        code: 0,
        msg: '移动成功',
        selected: clipboard.map(c => prefix + targetFolder + '/' + c.split('/').pop())
    };
};

const copy = async ctx => {
    const { clipboard, targetFolder } = ctx.request.body;
    ctx.response.type = 'json';
    const copyPromises = clipboard.map(c => cp(staticPath + c, staticPath + targetFolder + '/' + c.split('/').pop(), { recursive: true }))
    for (const copyPromise of copyPromises) {
        await copyPromise
    }
    const prefix = 'http://localhost:5000';
    ctx.response.body = {
        code: 0,
        msg: '复制成功',
        selected: clipboard.map(c => prefix + targetFolder + '/' + c.split('/').pop())
    };
};

const remove = async ctx => {
    const { selected } = ctx.request.body;
    ctx.response.type = 'json';
    const rmPromises = selected.map(s => rm(staticPath + s, { recursive: true }))
    for (const rmPromise of rmPromises) {
        await rmPromise
    }
    ctx.response.body = {
        code: 0,
        msg: '删除成功',
    };
};


const handler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    };
  }
};


app.use(handler);
app.use(koaBody());
app.use(main);
app.use(route.post('/api/dirents', dirents));
app.use(route.post('/api/cut', cut));
app.use(route.post('/api/copy', copy));
app.use(route.post('/api/remove', remove));
app.listen(5000);