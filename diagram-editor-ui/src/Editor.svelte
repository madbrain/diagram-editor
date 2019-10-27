<div id="diagramEvent" bind:this={diagramEventEl}
        on:mousedown={mouseDown} on:mousemove={mouseMove} on:mouseup={mouseUp} on:dblclick={dblClick}>
    <svg bind:this={diagramEl} width="100%" height="700">
        <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
                    markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto" style="fill: #555;">
                <path d="M 0 0 L 10 5 L 0 10 z"/>
            </marker>
            <filter id="drop-shadow" width="150%" height="150%">
                <feGaussianBlur in="SourceAlpha" result="blur-out" stdDeviation="2"/>
                <feOffset in="blur-out" result="the-shadow" dx="2" dy="2"/>
                <feBlend in="SourceGraphic" in2="the-shadow" mode="normal"/>
            </filter>
            <linearGradient id="rect-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: rgb(254, 254, 255); stop-opacity: 1;"/>
                <stop offset="100%" style="stop-color: rgb(247, 247, 255); stop-opacity: 1;"/>
            </linearGradient>
            <linearGradient id="rect-select-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: rgb(217, 237, 247); stop-opacity: 1;"/>
                <stop offset="100%" style="stop-color: rgb(201, 221, 247); stop-opacity: 1;"/>
            </linearGradient>
            <linearGradient id="rect-highlight-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: rgb(119, 238, 119); stop-opacity: 1;"/>
                <stop offset="100%" style="stop-color: rgb(103, 222, 103); stop-opacity: 1;"/>
            </linearGradient>
            <linearGradient id="rect-choose-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: rgb(119, 238, 238); stop-opacity: 1;"/>
                <stop offset="100%" style="stop-color: rgb(103, 222, 222); stop-opacity: 1;"/>
            </linearGradient>
        </defs>
        <g id="main">
            <rect width="100%" height="100%" fill="white" />
            <g id="nodes">
            </g>
            <g id="feedback">
            </g>
            <g id="palette">
            </g>
        </g>
    </svg>
    <DirectEdit bind:this={directEdit} />
</div>
<svelte:body on:keyup={keyUp} />

<style>
#diagramEvent {
    position: relative;
}

/* SVG CSS */
:global(g.simple text) {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
:global(g.drag-element > rect) {
    fill: url('#rect-gradient');
    fill-opacity: 0.5;
    stroke: #ccc; 
    stroke-width: 1px;
}
:global(rect.cursor) {
    fill: #ccc;
    stroke: #999; 
    stroke-width: 1px;
    stroke-dasharray: 3px 1px;
}
:global(g.simple > rect) {
    fill: url('#rect-gradient');
    stroke: #ccc; 
    stroke-width: 1px;
}
:global(g.choose > rect) {
    fill: url('#rect-choose-gradient');
    stroke: rgb(68, 128, 128);
}
:global(g.repeat > rect) {
    fill: url('#rect-highlight-gradient');
    stroke: rgb(68, 128, 68);
}
:global(g.node-selected > rect) {
    stroke: red;
    stroke-width: 2px;
}
:global(g.palette > rect) {
    fill: #888;
    stroke: #ccc;
    stroke-width: 1px;
}
</style>

<script>
    import { onMount } from "svelte";
    import { PaletteBox } from "./diagram";
    import { prepare, makeEvent } from "./app";
    import DirectEdit from "./DirectEdit.svelte";

    let diagramEventEl;
    let diagramEl;
    let state;
    let directEdit;

    const model = {
        nodes: [
            {
                id: 0, type: 'sequence', children: [
                    { id: 1, type: 'receive', label: 'MyService' },
                    { id: 2, type: 'invoke', label: 'OtherService' },
                    {
                        id: 3, type: 'choose', label: 'Node 3', children: [
                            {
                                id: 4, type: 'when', children: [
                                    { id: 5, type: 'transform', label: 'T1' },
                                    { id: 6, type: 'transform', label: 'T3' },
                                ]
                            },
                            {
                                id: 7, type: 'otherwise', children: [
                                    {
                                        id: 8, type: 'foreach', label: 'Node 5', children: [
                                            {
                                                id: 9, type: 'sequence', children: [
                                                    { id: 10, type: 'transform', label: 'T2' },
                                                ]
                                            },
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                    { id: 11, type: 'reply', label: 'MyService' },
                ]
            },
        ],
    };

    onMount(() => {
        state = prepare(diagramEl, model, directEdit);
    });

    function mouseDown(e) {
        state = state.mouseDown(makeEvent(e, diagramEventEl));
    }

    function mouseMove(e) {
        state = state.mouseMove(makeEvent(e, diagramEventEl));
    }

    function mouseUp(e) {
        state = state.mouseUp(makeEvent(e, diagramEventEl));
    }

    function dblClick(e) {
        state = state.mouseDoubleClick(makeEvent(e, diagramEventEl));
    }

    function keyUp(e) {
        state = state.keyUp(makeEvent(e, diagramEventEl));
    } 
</script>
