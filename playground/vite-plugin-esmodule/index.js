const { execa } = require('.vite-plugin-esmodule/execa');
const fetch = require('.vite-plugin-esmodule/node-fetch').default;


(async () => {
  const { stdout } = await execa('echo', ['unicorns']);
  console.log(stdout);

  console.log('\n-----------------\n');

  const response = await fetch('https://github.com/');
  const body = await response.text();
  console.log(body);
})();
