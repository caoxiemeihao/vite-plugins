<script setup>
import resolve1 from 'resolve1'
import pkg from 'package.json'

const message = `
import resolve1 from 'resolve1'

${resolve1}

// ----------------------------------------

import pkg from 'package.json'

${JSON.stringify(pkg, null, 4)}
`

</script>

<template>
  <div>
    <pre v-html="message" />
  </div>
</template>