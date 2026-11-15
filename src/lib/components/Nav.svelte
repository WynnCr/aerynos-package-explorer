<script lang="ts">
  import { router } from 'svelte-spa-router';
  import { compareStore } from '$lib/stores/compare.svelte';
  import {
    Search,
    Package,
    Layers,
    Scale,
    Info,
    ExternalLink,
    Menu,
    X,
    Activity
  } from 'lucide-svelte';

  let mobileMenuOpen = $state(false);

  function triggerSearchFocus() {
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

  function isActive(path: string): boolean {
    if (path === '/' && (router.location === '/' || router.location === '')) {
      return true;
    }
    if (path !== '/' && router.location.startsWith(path)) {
      return true;
    }
    return false;
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-[#242836] bg-[#0d0f14]/85 backdrop-blur-md">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <!-- Brand / Logo -->
    <div class="flex items-center gap-6">
      <a href="#/" class="group flex items-center gap-3 transition-opacity hover:opacity-90">
        <!-- AerynOS Heptagonal Emblem -->
        <div class="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1e28] border border-[#242836] shadow-sm group-hover:border-orange-500/50 transition-colors">
          <svg class="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 21 6.5 22 17 14.5 22 9.5 22 2 17 3 6.5 12 2" class="stroke-orange-500 fill-orange-500/10"/>
            <circle cx="12" cy="12" r="3" class="fill-orange-500 stroke-none"/>
          </svg>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight text-[#e8eaf0]">aeryn<span class="text-orange-500">OS</span></span>
            <span class="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-orange-400 uppercase border border-orange-500/20">
              Explorer
            </span>
          </div>
          <span class="text-[11px] text-[#8891a8]">Package Discovery Portal</span>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <nav class="hidden md:flex items-center space-x-1 pl-4 border-l border-[#242836]/60">
        <a
          href="#/"
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {isActive('/') ? 'bg-[#1a1e28] text-orange-400 border border-[#242836]' : 'text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]'}"
        >
          <Package class="h-3.5 w-3.5" />
          <span>Packages</span>
        </a>

        <a
          href="#/categories"
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {isActive('/categories') ? 'bg-[#1a1e28] text-orange-400 border border-[#242836]' : 'text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]'}"
        >
          <Layers class="h-3.5 w-3.5" />
          <span>Categories</span>
        </a>

        <a
          href="#/compare"
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {isActive('/compare') ? 'bg-[#1a1e28] text-orange-400 border border-[#242836]' : 'text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]'}"
        >
          <Scale class="h-3.5 w-3.5" />
          <span>Compare</span>
          {#if compareStore.count > 0}
            <span class="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-black">
              {compareStore.count}
            </span>
          {/if}
        </a>

        <a
          href="#/about"
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {isActive('/about') ? 'bg-[#1a1e28] text-orange-400 border border-[#242836]' : 'text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]'}"
        >
          <Info class="h-3.5 w-3.5" />
          <span>About</span>
        </a>
      </nav>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-3">
      <!-- Quick search trigger -->
      <button
        type="button"
        onclick={triggerSearchFocus}
        class="hidden sm:flex items-center gap-2 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 text-xs text-[#8891a8] transition hover:border-[#8891a8]/50 hover:text-[#e8eaf0]"
        title="Focus Search"
      >
        <Search class="h-3.5 w-3.5" />
        <span>Quick search</span>
        <kbd class="rounded bg-[#1a1e28] px-1.5 py-0.5 text-[10px] font-mono text-[#8891a8] border border-[#242836]">/</kbd>
      </button>

      <!-- External Links -->
      <div class="hidden lg:flex items-center gap-2 border-l border-[#242836]/60 pl-3">
        <a
          href="https://dash.aerynos.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-[#8891a8] transition hover:text-[#e8eaf0] hover:bg-[#13161d]"
          title="Summit Build Dashboard"
        >
          <Activity class="h-3.5 w-3.5 text-emerald-400" />
          <span>Summit</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>

        <a
          href="https://github.com/aerynOS/recipes"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#8891a8] transition hover:text-[#e8eaf0] hover:bg-[#13161d]"
          title="GitHub Recipes Repository"
        >
          <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>Recipes</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>
      </div>

      <!-- Mobile menu button -->
      <button
        type="button"
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
        class="flex md:hidden items-center justify-center rounded-lg border border-[#242836] p-2 text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]"
        aria-label="Toggle Navigation Menu"
      >
        {#if mobileMenuOpen}
          <X class="h-5 w-5" />
        {:else}
          <Menu class="h-5 w-5" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Drawer Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-[#242836] bg-[#0d0f14] px-4 pt-3 pb-5 space-y-2">
      <button
        type="button"
        onclick={() => {
          mobileMenuOpen = false;
          triggerSearchFocus();
        }}
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]"
      >
        <Search class="h-4 w-4" />
        <span>Search Packages</span>
      </button>

      <a
        href="#/"
        onclick={() => mobileMenuOpen = false}
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium {isActive('/') ? 'bg-[#1a1e28] text-orange-400' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
      >
        <Package class="h-4 w-4" />
        <span>Packages</span>
      </a>

      <a
        href="#/categories"
        onclick={() => mobileMenuOpen = false}
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium {isActive('/categories') ? 'bg-[#1a1e28] text-orange-400' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
      >
        <Layers class="h-4 w-4" />
        <span>Categories</span>
      </a>

      <a
        href="#/compare"
        onclick={() => mobileMenuOpen = false}
        class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium {isActive('/compare') ? 'bg-[#1a1e28] text-orange-400' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
      >
        <div class="flex items-center gap-2">
          <Scale class="h-4 w-4" />
          <span>Compare Packages</span>
        </div>
        {#if compareStore.count > 0}
          <span class="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-black">
            {compareStore.count}
          </span>
        {/if}
      </a>

      <a
        href="#/about"
        onclick={() => mobileMenuOpen = false}
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium {isActive('/about') ? 'bg-[#1a1e28] text-orange-400' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
      >
        <Info class="h-4 w-4" />
        <span>About</span>
      </a>

      <div class="border-t border-[#242836] pt-3 flex flex-col gap-2">
        <a
          href="https://dash.aerynos.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]"
        >
          <div class="flex items-center gap-2">
            <Activity class="h-4 w-4 text-emerald-400" />
            <span>Summit Build Dashboard</span>
          </div>
          <ExternalLink class="h-3.5 w-3.5 opacity-60" />
        </a>

        <a
          href="https://github.com/aerynOS/recipes"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]"
        >
          <span>GitHub Recipes</span>
          <ExternalLink class="h-3.5 w-3.5 opacity-60" />
        </a>
      </div>
    </div>
  {/if}
</header>
