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
async function setView4(id) {
  const { msg } = await __variableDynamicImportRuntime3__(`./views${id}`);
  document.querySelector(".view").innerHTML = msg;
}
async function setView5(id) {
  const { msg } = await __variableDynamicImportRuntime4__(`./views${id}.tsx`);
  document.querySelector(".view").innerHTML = msg;
}
async function setView6() {
  const { msg } = await import("@/views/foo.js");
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
const views4 = {
  "may-foo": () => setView4("/foo"),
  "may-bar": () => setView4("/bar"),
  "may-nesting": () => setView4("/nested/nesting"),
  "may-nesting-dir": () => setView4("/nested/nesting-dir")
};
const views5 = {
  "may-ext-baz": () => setView5("/baz/index"),
  "may-ext-nesting-dir": () => setView5("/nested/nesting-dir/index")
};
const views6 = {
  "may-normally-alias": () => setView6()
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
Object.entries(views4).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});
Object.entries(views5).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});
Object.entries(views6).forEach(([className, cb]) => {
  document.querySelector(`.${className}`).addEventListener("click", cb);
});

// --------- ${PLUGIN_NAME} ---------

function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case '@/views/foo.js':
      return import('@/views/foo.js');

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
      return import('src/views/bar.mjs');

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
      return import('/root/src/views/bar.mjs');

    case '/root/src/views/foo.js':
    case '/root/src/views/foo':
      return import('/root/src/views/foo.js');

    case '/root/src/views/baz/index.tsx':
    case '/root/src/views/baz/index':
    case '/root/src/views/baz':
      return import('/root/src/views/baz/index.tsx');

    case '/root/src/views/home/index.ts':
    case '/root/src/views/home/index':
    case '/root/src/views/home':
      return import('/root/src/views/home/index.ts');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}

function __variableDynamicImportRuntime3__(path) {
  switch (path) {
    case './views/bar.mjs':
    case './views/bar':
      return import('./views/bar.mjs');

    case './views/foo.js':
    case './views/foo':
      return import('./views/foo.js');

    case './views/baz/index.tsx':
    case './views/baz/index':
    case './views/baz':
      return import('./views/baz/index.tsx');

    case './views/home/index.ts':
    case './views/home/index':
    case './views/home':
      return import('./views/home/index.ts');

    case './views/nested/nesting.ts':
    case './views/nested/nesting':
      return import('./views/nested/nesting.ts');

    case './views/nested/nesting-dir/index.tsx':
    case './views/nested/nesting-dir/index':
    case './views/nested/nesting-dir':
      return import('./views/nested/nesting-dir/index.tsx');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}

function __variableDynamicImportRuntime4__(path) {
  switch (path) {
    case './views/baz/index.tsx':
      return import('./views/baz/index.tsx');

    case './views/nested/nesting-dir/index.tsx':
      return import('./views/nested/nesting-dir/index.tsx');

    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic import: " + path))
      );
    })
  }
}
