<script lang="ts">
  import type { ChannelType } from '$lib/data/types';
  import { Zap, CheckCircle2, FileCode, Layers } from 'lucide-svelte';

  let {
    channel = 'both',
    size = 'sm'
  }: {
    channel?: ChannelType;
    size?: 'sm' | 'md';
  } = $props();
</script>

{#if channel === 'volatile'}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/25"
    title="Available in volatile staging repository only. Awaiting promotion to unstable."
  >
    <Zap class="{size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-amber-400" />
    <span>volatile only</span>
  </span>
{:else if channel === 'both' || channel === 'unstable'}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25"
    title="Available in standard unstable repository and volatile stream."
  >
    <span class="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
    <span>unstable</span>
  </span>
{:else}
  <span
    class="inline-flex items-center gap-1 rounded font-medium border transition-colors {size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-purple-500/15 text-purple-300 border-purple-500/35 hover:bg-purple-500/25"
    title="Recipe indexed in git; pending build in Summit."
  >
    <FileCode class="{size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-purple-400" />
    <span>recipe only</span>
  </span>
{/if}
