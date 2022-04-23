import angular from '@angular/core'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHashHistory } from 'vue-router'

app.innerHTML += `
<pre>
import angular from '@angular/core'

${JSON.stringify(angular)}

// ----------------------------------------
import { createApp } from 'vue'

  ${createApp}

// ----------------------------------------

import { createApp } from 'pinia'

  ${createPinia}

// ----------------------------------------

import { createWebHashHistory } from 'vue-router'

  ${createWebHashHistory}

</pre>
`
