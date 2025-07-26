<script lang="ts">
  import { onMount } from "svelte";
  import { Editor } from "./editor";
  import Fa from "svelte-fa";
  import { faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";
  import type { StackEvent } from "./command";
  import type { DiagramType } from "./diagram";
  // import diagramType from "./sequence/diagram";

  export let diagramType: DiagramType;

  let container: HTMLElement;
  let editor: Editor;
  let paletteState: StackEvent = { canUndo: false, canRedo: false };

  onMount(() => {
    editor = new Editor(diagramType, {
      container,
      collaborationUrl: "ws://localhost:3000",
    });
    editor.onStackChange((e) => {
      paletteState = e;
    });
    editor.onPresenceChange((users) => {
      // console.log("USERS", users);
    });
  });
</script>

<div class="container">
  <div class="container" bind:this={container}></div>
  <div class="palette">
    <ul>
      <li>
        <button
          disabled={!paletteState.canUndo}
          on:click={() => editor.undo()}
          title="Undo"><Fa icon={faUndo} /></button
        >
      </li>
      <li>
        <button
          disabled={!paletteState.canRedo}
          on:click={() => editor.redo()}
          title="Redo"><Fa icon={faRedo} /></button
        >
      </li>
      {#each diagramType.actions as action}
        <li class="spacer">
          <button on:click={() => action.run(editor)}>{action.label}</button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  div.container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  div.palette {
    position: absolute;
    bottom: 20px;
    left: 100px;
    /* border: 1px solid black; */
    border-radius: 5px;
    background: white;
    box-shadow: 2px 2px 5px gray;
  }

  .palette ul {
    padding: 0px;
    margin: 10px;
  }

  .palette li {
    display: inline-block;
  }

  li.spacer {
    margin-left: 10px;
  }
</style>
