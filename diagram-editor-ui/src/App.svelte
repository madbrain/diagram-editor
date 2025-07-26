<script lang="ts">
  import Header from "./components/Header.svelte";
  import Editor from "./Editor.svelte";
  import diagramType from "./sequence/diagram";
</script>

<div class="root">
  <Header />
  <Editor {diagramType} />
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: Roboto;
  }

  .root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
