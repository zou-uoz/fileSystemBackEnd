const { readdir } = require('node:fs/promises');
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
            name: prefix + body.path + '/' + d.name,
            isDirectory: d.isDirectory(),
        }))
    }
    ctx.response.body = response;
};

app.use(koaBody());
app.use(main);
app.use(route.post('/api/dirents', dirents));
app.listen(5000);