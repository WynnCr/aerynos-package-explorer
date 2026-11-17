export type StreamType = 'both' | 'volatile' | 'unstable' | 'recipe';
/** Backward compatibility alias for StreamType */
export type ChannelType = StreamType;

export interface Upstream {
  url: string;
  hash: string;
  type: 'tarball' | 'git';
}

export interface SubPackage {
  name: string;
  summary?: string;
  description?: string;
  rundeps?: string[];
  paths?: string[];
  channel?: ChannelType;
}

export interface Package {
  // Core (always present in stone.yaml)
  name: string;
  version: string;
  release: number;
  homepage: string;
  summary: string;
  description: string;
  license: string[];  // normalized to array even if single string in YAML
  
  // Often present
  builddeps?: string[];
  rundeps?: string[];
  checkdeps?: string[];   // only needed to run the test suite
  
  // Occasionally present
  toolchain?: string;
  emul32?: boolean;
  packages?: SubPackage[];
  
  // Heavy fields. Not in packages.json: they live in data/details/<letter>.json
  // (see PackageDetails) and are merged in on the package page.
  upstreams?: Upstream[];
  setup?: string;
  build?: string;
  install?: string;
  check?: string;
  environment?: string;
  tuning?: string[];
  profiles?: Record<string, unknown>;

  // Computed by indexer
  letter: string;           // first letter of name (directory shard)
  recipeUrl: string;        // https://github.com/aerynOS/recipes/blob/main/<l>/<name>/stone.yaml
  rawUrl: string;           // https://raw.githubusercontent.com/aerynOS/recipes/main/<l>/<name>/stone.yaml
  category?: string;        // inferred category (not official metadata)
  channel?: ChannelType;    // 'both' (in unstable & volatile), 'volatile' (volatile only), 'recipe'
}

/** What data/details/<letter>.json holds per package name: everything the search page doesn't need. */
export interface PackageDetails {
  upstreams: Upstream[];
  setup?: string;
  build?: string;
  install?: string;
  check?: string;
  environment?: string;
  tuning?: string[];
  profiles?: Record<string, unknown>;
  /** Parallel to Package.packages (by index: a recipe can list the same sub-package name twice) */
  subpackages?: ({ description?: string; paths?: string[] } | null)[];
}

export type DetailsShard = Record<string, PackageDetails>;

export interface ChannelStats {
  volatileCount: number;
  unstableCount: number;
  volatileOnlyCount: number;
  bothCount: number;
  recipeOnlyCount: number;
}

export interface PackageIndex {
  packages: Package[];
  generatedAt: string;    // ISO timestamp; only moves when the content changes
  totalCount: number;
  repoUrl: string;        // https://github.com/aerynOS/recipes
  commitSha?: string;     // aerynOS/recipes commit the index was built from
  channelStats?: ChannelStats;
}

export interface SearchFilters {
  license?: string;
  category?: string;
  letter?: string;
  toolchain?: string;
  channel?: ChannelType | 'all';
  stream?: StreamType | 'all';
}

export type SortOrder = 'name-asc' | 'name-desc';
