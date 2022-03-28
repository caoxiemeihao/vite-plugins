async function setView1(id) {
  const { msg } = await __variableDynamicImportRuntime0__(`@/views/${id}.js`);
  document.querySelector(".view").innerHTML = msg;
}
async function setView2(id) {
  const { msg } = await __variableDynamicImportRuntime1__(`src/views/${id}.mjs`);
  document.querySelector(".view").innerHTML = msg;
}
async function setView3(id) {
  const { msg } = await __variableDynamicImportRuntime2__(`/root/src/views/${id}`);
  document.querySelector(".view").innerHTML = msg;
}
const views1 = {
  "foo-alias1": () => setView1("foo")
};
const views2 = {
  "bar-alias2": () => setView2("bar")
};
const views3 = {
  "foo-alias3": () => setView3("foo"),
  "bar-alias3": () => setView3("bar"),
  "baz-alias3": () => setView3("baz"),
  "home-alias3": () => setView3("home")
};
Object.entries(views1).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});
Object.entries(views2).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});
Object.entries(views3).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});

// --------- vite-plugin-dynamic-import ---------

function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case '@/views/foo.js':
    case '@/views/foo':
      return import('./views/foo.js');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}

function __variableDynamicImportRuntime1__(path) {
  switch (path) {
    case 'src/views/bar.mjs':
    case 'src/views/bar':
      return import('./views/bar.mjs');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}

function __variableDynamicImportRuntime2__(path) {
  switch (path) {
    case '/root/src/views/bar.mjs':
    case '/root/src/views/bar':
      return import('./views/bar.mjs');

    case '/root/src/views/foo.js':
    case '/root/src/views/foo':
      return import('./views/foo.js');

    case '/root/src/views/baz/index.tsx':
    case '/root/src/views/baz/index':
    case '/root/src/views/baz':
      return import('./views/baz/index.tsx');

    case '/root/src/views/home/index.ts':
    case '/root/src/views/home/index':
    case '/root/src/views/home':
      return import('./views/home/index.ts');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}
