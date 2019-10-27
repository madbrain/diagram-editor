<div class="directEdit">
{#if opened}
    <input bind:this={directEditInput} bind:value={inputValue}
            style="left: {x}px; top: {y}px; width: {w}px; height: {h}px" type="text" use:init on:keyup={keyup} >
{/if}
</div>

<style>
.directEdit {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 10;
}
.directEdit input {
    position: absolute;
    border: solid 1px gray; 
}
</style>

<script>
    let onChange;
    let opened = false;
    let directEditInput;
    let inputValue = "";
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;

    export function start(directEdit, cb) {
        onChange = cb;
        inputValue = directEdit.value;
        x = directEdit.bounds.x;
        y = directEdit.bounds.y;
        w = directEdit.bounds.width;
        h = directEdit.bounds.height;
        opened = true;
    }

    export function cancel() {
        opened = false;
    }

    function init(el) {
        el.select();
        el.focus();
    }

    function keyup(ev) {
        if (ev.keyCode == 27) {
            cancel();
        } else if (ev.keyCode == 13) {
            onChange(inputValue);
            cancel();
        }
    }
    
</script>