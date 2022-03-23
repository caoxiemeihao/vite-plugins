const path = require('path');
const { execa } = require('.vite-plugin-esmodule/execa');
const fetch = require('.vite-plugin-esmodule/node-fetch').default;
const { fileTypeFromFile } = require('.vite-plugin-esmodule/file-type');

(async () => {
  const { stdout } = await execa('echo', ['unicorns']);
  console.log(stdout);

  console.log('\n-----------------\n');
  
  const response = await fetch('https://github.com/');
  const body = await response.text();
  // console.log(body);

  console.log('\n-----------------\n');

  // const tokenizer = await (void 0)(path);
  //                                 ^
  // TypeError: (void 0) is not a function
  // ---- build with vite ----
  const fileType = await fileTypeFromFile('vue.ico');
  console.log(fileType);
})();
