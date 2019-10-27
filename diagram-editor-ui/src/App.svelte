<NavBar name="Diagram Editor"/>

<main role="main" class="container-fluid">

  <div class="starter-template">
    <Router {routes}/>
  </div>

</main><!-- /.container -->

<style>
:global(body) {
  padding-top: 5rem;
}
.starter-template {
  padding: 3rem 1.5rem;
  text-align: center;
}
</style>

<script>
    import NavBar from './NavBar.svelte';
    import Editor from './Editor.svelte';
    import Other from './Other.svelte';
    import Router from 'svelte-spa-router';

    let routes = {
        '/': Editor,
        '/other': Other
    };
</script>