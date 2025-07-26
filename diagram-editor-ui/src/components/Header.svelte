<script lang="ts">
  interface Menu {
    label: string;
    items: {
      label: string;
    }[];
  }
  const menus: Menu[] = [
    {
      label: "Drawing",
      items: [
        { label: "New Sequence Diagram" },
        { label: "New Model Diagram" },
      ],
    },
    {
      label: "Export",
      items: [{ label: "SVG" }, { label: "Image" }],
    },
  ];
</script>

<div class="header">
  <div class="menu-bar">
    {#each menus as menu}
      <div class="menu">
        <button class="menu-btn">{menu.label}</button>
        <div class="menu-dropdown">
          {#each menu.items as item}
            <button class="menu-btn">{item.label}</button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .header {
    width: 100vw;
    background-color: #444444;
    border-bottom: 1px solid #565656;
    color: white;
     position: relative;
  }
  .menu-bar {
    display: flex;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .menu {
    display: inline-block;
  }
  .menu:hover {
    background-color: #808080;
  }
  .menu:hover .menu-dropdown {
    display: block;
  }
  .menu-dropdown {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  .menu-dropdown .menu-btn {
    color: black;
    display: block;
  }
  .menu-btn {
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    font-size: 16px;
  }
</style>
