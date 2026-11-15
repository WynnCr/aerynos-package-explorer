<script lang="ts">
  import type { StreamType, ChannelType } from '$lib/data/types';
  import { Zap, FileCode } from 'lucide-svelte';

  let {
    stream,
    channel = 'both',
    size = 'sm'
  }: {
    stream?: StreamType;
    channel?: ChannelType;
    size?: 'sm' | 'md';
  } = $props();

  let activeStream = $derived(stream || channel || 'both');
</script>

{#if activeStream === 'volatile'}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/25"
    title="Available in volatile stream only (tip/HEAD pointer of main channel). Awaiting tag & promotion to unstable stream."
  >
    <Zap class="{size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-amber-400" />
    <span>volatile stream</span>
  </span>
{:else if activeStream === 'both' || activeStream === 'unstable'}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25"
    title="Available in unstable stream (default user stream on main channel)."
  >
    <span class="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
    <span>unstable stream</span>
  </span>
{:else}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-purple-500/15 text-purple-300 border-purple-500/35 hover:bg-purple-500/25"
    title="Recipe indexed in git; pending build into main channel."
  >
    <FileCode class="{size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-purple-400" />
    <span>recipe only</span>
  </span>
{/if}
