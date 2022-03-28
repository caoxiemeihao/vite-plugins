
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

Object.entries(views1).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views2).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
Object.entries(views3).forEach(([className, cb]) => {
  document.querySelector(`.${className}`)!.addEventListener('click', cb)
})
