<script lang="ts">
  import { onMount } from 'svelte';

  let {
    value = $bindable(''),
    placeholder = 'Search packages',
    autofocus = false,
    onsearch
  }: {
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    onsearch?: (query: string) => void;
  } = $props();

  let inputEl = $state<HTMLInputElement | null>(null);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onsearch?.(value);
  }

  function handleClear() {
    value = '';
    onsearch?.('');
    inputEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (value) {
        handleClear();
      } else {
        inputEl?.blur();
      }
    }
  }

  onMount(() => {
    function onFocusEvent() {
      inputEl?.focus();
      inputEl?.select();
    }

    window.addEventListener('focus-search', onFocusEvent);
    if (autofocus) {
      inputEl?.focus();
    }

    return () => {
      window.removeEventListener('focus-search', onFocusEvent);
    };
  });
</script>

<div class="relative w-full">
  <input
    bind:this={inputEl}
    type="search"
    {value}
    oninput={handleInput}
    onkeydown={handleKeydown}
    {placeholder}
    aria-label="Search packages"
    class="w-full rounded border border-line bg-surface py-2 pl-3 pr-10 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
    spellcheck="false"
    autocomplete="off"
  />
  {#if value}
    <button
      type="button"
      onclick={handleClear}
      class="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-sm text-muted hover:text-fg"
      aria-label="Clear search"
    >clear</button>
  {:else}
    <kbd class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-xs text-muted sm:block">/</kbd>
  {/if}
</div>
