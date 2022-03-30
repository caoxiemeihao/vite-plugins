
async function setView1(id: string) {
  const { msg } = await import(`@/views/${id}.js`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView2(id: string) {
  const { msg } = await import(`src/views/${id}.mjs`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView3(id: string) {
  const { msg } = await import(`/root/src/views/${id}`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView4(id: string) {
  // This will match all modules under `views` as far as possible
  const { msg } = await import(`./views${id}`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView5(id: string) {
  // This will match all modules ending in `.tsx` under `views` as far as possible
  const { msg } = await import(`./views${id}.tsx`)
  document.querySelector('.view')!.innerHTML = msg
}

const views1 = {
  'foo-alias1': () => setView1('foo'),
}
const views2 = {
  'bar-alias2': () => setView2('bar'),
}
const views3 = {
  'foo-alias3': () => setView3('foo'),
  'bar-alias3': () => setView3('bar'),
  'baz-alias3': () => setView3('baz'),
  'home-alias3': () => setView3('home'),
}
const views4 = {
  'may-foo': () => setView4('/foo'),
  'may-bar': () => setView4('/bar'),
  'may-nesting': () => setView4('/nested/nesting'),
  'may-nesting-dir': () => setView4('/nested/nesting-dir'),
}
const views5 = {
  'may-ext-baz': () => setView4('/baz'),
  'may-ext-nesting-dir': () => setView4('/nested/nesting-dir'),
}

Object.entries(views1).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views2).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views3).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views4).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views5).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
