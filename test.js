const { rename } = require('node:fs');

rename('public/a1.jpg', 'public/测试目录1/a1.jpg', (err) => {
  if (err) throw err;
  console.log('Rename complete!');
});