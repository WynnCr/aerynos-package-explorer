<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, X } from 'lucide-svelte';

  let {
    value = $bindable(''),
    placeholder = 'Search by package name, command, description, or dependency (press / to focus)...',
    autofocus = false,
    onsearch
  }: {
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    onsearch?: (query: string) => void;
  } = $props();

  let inputEl = $state<HTMLInputElement | null>(null);
  let isFocused = $state(false);

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
  <div
    class="group flex w-full items-center rounded-xl border bg-[#13161d] px-4 py-3 shadow-lg transition-all duration-200 {isFocused ? 'border-orange-500/80 ring-2 ring-orange-500/20 shadow-orange-950/20' : 'border-[#242836] hover:border-[#8891a8]/40'}"
  >
    <!-- Search Icon -->
    <Search class="h-5 w-5 shrink-0 text-[#8891a8] transition-colors {isFocused ? 'text-orange-400' : 'group-hover:text-[#e8eaf0]'}" />

    <!-- Text Input -->
    <input
      bind:this={inputEl}
      type="text"
      {value}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => isFocused = true}
      onblur={() => isFocused = false}
      {placeholder}
      class="ml-3 w-full bg-transparent text-sm sm:text-base text-[#e8eaf0] placeholder-[#8891a8]/70 focus:outline-none"
      spellcheck="false"
      autocomplete="off"
    />

    <!-- Right Controls: Clear button and keyboard shortcut -->
    <div class="ml-2 flex items-center gap-2 shrink-0">
      {#if value}
        <button
          type="button"
          onclick={handleClear}
          class="rounded p-1 text-[#8891a8] hover:bg-[#1a1e28] hover:text-[#e8eaf0] transition"
          aria-label="Clear search"
          title="Clear search (Esc)"
        >
          <X class="h-4 w-4" />
        </button>
      {/if}

      <div class="hidden sm:flex items-center">
        {#if isFocused && value}
          <kbd class="rounded border border-[#242836] bg-[#1a1e28] px-2 py-0.5 text-[10px] font-mono text-[#8891a8]">
            Esc to clear
          </kbd>
        {:else}
          <kbd class="rounded border border-[#242836] bg-[#1a1e28] px-2 py-0.5 text-[11px] font-mono text-[#8891a8] shadow-sm">
            /
          </kbd>
        {/if}
      </div>
    </div>
  </div>
</div>
