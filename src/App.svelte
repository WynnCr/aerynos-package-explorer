<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { packageStore } from '$lib/stores/packages.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Home from './routes/Home.svelte';
  import PackageDetail from './routes/PackageDetail.svelte';
  import CategoryBrowse from './routes/CategoryBrowse.svelte';
  import Compare from './routes/Compare.svelte';
  import About from './routes/About.svelte';

  const routes = {
    '/': Home,
    '/package/:name': PackageDetail,
    '/categories': CategoryBrowse,
    '/categories/:category': CategoryBrowse,
    '/compare': Compare,
    '/about': About,
    '*': Home,
  };

  onMount(() => {
    // Initial fetch of package database
    packageStore.load();

    // Global keyboard shortcuts
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Press '/' to focus search input if not currently typing in a field
      if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const currentHash = window.location.hash;
        if (currentHash && currentHash !== '#/' && currentHash !== '#' && !currentHash.startsWith('#/categories')) {
          window.location.hash = '#/';
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('focus-search'));
          }, 50);
        } else {
          window.dispatchEvent(new CustomEvent('focus-search'));
        }
      }
    }

    function handleHashChange() {
      window.scrollTo(0, 0);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
</script>

<div class="min-h-screen flex flex-col">
  <Nav />

  <main class="flex-1 w-full pb-12">
    <Router
      {routes}
      restoreScrollState={true}
      onRouteLoaded={() => window.scrollTo(0, 0)}
    />
  </main>

  <Footer />
</div>
