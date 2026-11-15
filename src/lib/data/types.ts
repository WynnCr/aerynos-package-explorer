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
  upstreams: Upstream[];
  
  // Often present
  builddeps?: string[];
  rundeps?: string[];
  
  // Occasionally present
  toolchain?: string;
  emul32?: boolean;
  packages?: SubPackage[];
  defaultPackageName?: string;
  
  // Build phases (raw text, for display)
  setup?: string;
  build?: string;
  install?: string;
  check?: string;
  environment?: string;
  
  // Computed by indexer
  letter: string;           // first letter of name (directory shard)
  recipeUrl: string;        // https://github.com/aerynOS/recipes/blob/main/recipes/<l>/<name>/stone.yaml
  rawUrl: string;           // https://raw.githubusercontent.com/aerynOS/recipes/main/recipes/<l>/<name>/stone.yaml
  category?: string;        // inferred category (not official metadata)
  
  // Index metadata
  indexedAt: string;        // ISO timestamp
  lastModified?: string;    // ISO timestamp from GitHub API if available
}

export interface PackageIndex {
  packages: Package[];
  generatedAt: string;    // ISO timestamp
  totalCount: number;
  repoUrl: string;        // https://github.com/aerynOS/recipes
  commitSha?: string;     // git commit SHA at time of indexing
}

export interface SearchFilters {
  license?: string;
  category?: string;
  letter?: string;
  toolchain?: string;
}

export type SortOrder = 'name-asc' | 'name-desc' | 'recently-updated' | 'recently-added';
