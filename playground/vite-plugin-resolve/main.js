import resolve1 from 'resolve1'
import pkg from 'package.json'

app.innerHTML += `
<pre>
import resolve1 from 'resolve1'

${resolve1}

// ----------------------------------------

import pkg from 'package.json'

${JSON.stringify(pkg, null, 4)}
</pre>
`
