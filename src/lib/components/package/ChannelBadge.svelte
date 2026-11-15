<script lang="ts">
  import type { StreamType, ChannelType } from '$lib/data/types';

  let {
    stream,
    channel = 'both',
    size = 'sm'
  }: {
    stream?: StreamType;
    channel?: ChannelType;
    size?: 'sm' | 'md';
  } = $props();

  let active = $derived(stream || channel || 'both');

  const labels = {
    volatile: {
      text: 'volatile only',
      dot: 'bg-warn',
      title: 'Only in the volatile stream (tip of the main channel). Not yet promoted to the unstable stream.'
    },
    unstable: {
      text: 'unstable',
      dot: 'bg-ok',
      title: 'In the unstable stream, the default for AerynOS installs.'
    },
    recipe: {
      text: 'recipe only',
      dot: 'bg-muted',
      title: 'Recipe exists in git; no build in the main channel yet.'
    }
  } as const;

  let info = $derived(active === 'volatile' ? labels.volatile : active === 'recipe' ? labels.recipe : labels.unstable);
</script>

<span
  class="inline-flex items-center gap-1.5 text-muted {size === 'sm' ? 'text-xs' : 'text-sm'}"
  title={info.title}
>
  <span class="inline-block h-1.5 w-1.5 rounded-full {info.dot}" aria-hidden="true"></span>
  {info.text}
</span>
