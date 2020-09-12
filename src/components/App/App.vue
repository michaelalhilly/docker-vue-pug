<script src="./App.js"></script>
<style lang="scss">@use "./App.scss";</style>
<template lang="pug">
  div#app
    div#nav
      router-link(to="/") Home
      router-link(to="/about") About
    router-view
</template>
