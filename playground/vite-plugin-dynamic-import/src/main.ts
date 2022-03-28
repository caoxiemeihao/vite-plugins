
async function setView1(id: string) {
  const { msg } = await import(`@/views/${id}.js`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView2(id: string) {
  const { msg } = await import(`src/views/${id}.js`)
  document.querySelector('.view')!.innerHTML = msg
}
async function setView3(id: string) {
  const { msg } = await import(`/root/src/views/${id}.js`)
  document.querySelector('.view')!.innerHTML = msg
}

const views1 = {
  foo: () => setView1('foo'),
  bar: () => setView1('bar'),
  baz: () => setView1('baz'),
}
const views2 = {
  foo: () => setView2('foo'),
  bar: () => setView2('bar'),
  baz: () => setView2('baz'),
}


const views3 = {
  foo: () => setView3('foo'),
  bar: () => setView3('bar'),
  baz: () => setView3('baz'),
}
