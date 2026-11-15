<script lang="ts">
  import { router } from 'svelte-spa-router';
  import { compareStore } from '$lib/stores/compare.svelte';

  const links = [
    { href: '#/', path: '/', label: 'Packages' },
    { href: '#/categories', path: '/categories', label: 'Categories' },
    { href: '#/compare', path: '/compare', label: 'Compare' },
    { href: '#/about', path: '/about', label: 'About' }
  ];

  function isActive(path: string): boolean {
    const loc = router.location || '/';
    if (path === '/') return loc === '/' || loc.startsWith('/package');
    return loc.startsWith(path);
  }
</script>

<header class="border-b border-line">
  <div class="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
    <a href="#/" class="font-semibold">
      aerynOS package explorer
      <span class="font-normal text-muted">(unofficial)</span>
    </a>

    <nav class="flex gap-5 text-sm" aria-label="Main">
      {#each links as link}
        <a
          href={link.href}
          aria-current={isActive(link.path) ? 'page' : undefined}
          class="underline-offset-[6px] decoration-accent decoration-2 hover:text-fg {isActive(link.path) ? 'text-fg underline' : 'text-muted'}"
        >
          {link.label}{#if link.path === '/compare' && compareStore.count > 0}&nbsp;({compareStore.count}){/if}
        </a>
      {/each}
    </nav>
  </div>
</header>
