import vue from 'vue'
import angular from '@angular/core'

app.innerHTML += `
<pre>
import vue from 'vue'

${vue}

// ----------------------------------------

import angular from '@angular/core'

${JSON.stringify(angular)}
</pre>
`
