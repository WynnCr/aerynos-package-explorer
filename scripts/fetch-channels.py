#!/usr/bin/env python3
"""
fetch-channels.py
Fetches live repository stream metadata from cdn.aerynos.dev for the main Channel
(specifically stream/volatile and stream/unstable), decompresses binary stone.index files
using libzstd, and writes static/data/channels.json.
"""

import urllib.request
import json
import ctypes
import os
import sys
import time
from datetime import datetime, timezone

ROOT_INDEX_URL = "https://cdn.aerynos.dev/main/moss-root-index.json"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "static", "data", "channels.json")
MIN_PACKAGES = 500  # the real streams hold ~2000 names each


def load_zstd():
    candidates = [
        "/usr/lib/libzstd.so.1",
        "/usr/lib/x86_64-linux-gnu/libzstd.so.1",
        "/usr/lib64/libzstd.so.1",
        "libzstd.so.1",
        "libzstd.so"
    ]
    for c in candidates:
        try:
            return ctypes.CDLL(c)
        except Exception:
            continue
    raise RuntimeError("Could not load libzstd.so.1")

class ZSTD_inBuffer(ctypes.Structure):
    _fields_ = [("src", ctypes.c_void_p), ("size", ctypes.c_size_t), ("pos", ctypes.c_size_t)]

class ZSTD_outBuffer(ctypes.Structure):
    _fields_ = [("dst", ctypes.c_void_p), ("size", ctypes.c_size_t), ("pos", ctypes.c_size_t)]

def http_get(req, timeout, attempts=3):
    """GET with a few retries; the CDN occasionally resets connections."""
    last = None
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as e:  # noqa: BLE001 - report the last one
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"GET {req.full_url} failed after {attempts} attempts: {last}")


def parse_stone_index(libzstd, url):
    print(f"Fetching index from {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0.0"})
    data = http_get(req, timeout=30)

    ZSTD_createDStream = libzstd.ZSTD_createDStream
    ZSTD_createDStream.restype = ctypes.c_void_p
    ZSTD_initDStream = libzstd.ZSTD_initDStream
    ZSTD_initDStream.argtypes = [ctypes.c_void_p]
    ZSTD_initDStream.restype = ctypes.c_size_t
    ZSTD_decompressStream = libzstd.ZSTD_decompressStream
    ZSTD_decompressStream.argtypes = [ctypes.c_void_p, ctypes.POINTER(ZSTD_outBuffer), ctypes.POINTER(ZSTD_inBuffer)]
    ZSTD_decompressStream.restype = ctypes.c_size_t

    dstream = ZSTD_createDStream()
    magic = b"\x28\xb5\x2f\xfd"
    pos = data.find(magic)
    packages = set()

    while pos != -1:
        src_buf = ctypes.create_string_buffer(data[pos:])
        in_buf = ZSTD_inBuffer(ctypes.cast(src_buf, ctypes.c_void_p), len(data) - pos, 0)
        out_arr = ctypes.create_string_buffer(131072)
        out_buf = ZSTD_outBuffer(ctypes.cast(out_arr, ctypes.c_void_p), 131072, 0)

        ZSTD_initDStream(dstream)
        ZSTD_decompressStream(dstream, ctypes.byref(out_buf), ctypes.byref(in_buf))
        if out_buf.pos > 0:
            chunk = out_arr.raw[:out_buf.pos]
            j = 0
            while j < len(chunk) - 8:
                length = int.from_bytes(chunk[j:j+4], "big")
                tag = int.from_bytes(chunk[j+4:j+6], "big")
                vtype = int.from_bytes(chunk[j+6:j+8], "big")
                if tag == 1 and vtype == 0x0900 and 0 < length < 200 and j + 8 + length <= len(chunk):
                    pname = chunk[j+8:j+8+length].rstrip(b"\x00").decode("utf-8", errors="ignore")
                    packages.add(pname)
                    break
                j += 1
            pos = pos + in_buf.pos
            pos = data.find(magic, pos)
        else:
            pos = data.find(magic, pos + 4)

    return sorted(list(packages))

def main():
    start = time.time()
    print("Starting aerynOS channel indexer...")
    try:
        libzstd = load_zstd()
    except Exception as e:
        print(f"Error loading libzstd: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading root index from {ROOT_INDEX_URL}...")
    req = urllib.request.Request(ROOT_INDEX_URL, headers={"User-Agent": "curl/8.0.0"})
    root_data = json.loads(http_get(req, timeout=15).decode())

    volatile_history = root_data.get("streams", {}).get("volatile", {}).get("history")
    unstable_history = root_data.get("streams", {}).get("unstable", {}).get("history")

    if not volatile_history or not unstable_history:
        print("Could not resolve volatile/unstable history IDs from root index.", file=sys.stderr)
        sys.exit(1)

    print(f"Resolved history IDs: volatile={volatile_history}, unstable={unstable_history}")

    v_url = f"https://cdn.aerynos.dev/main/history/{volatile_history}/x86_64/stone.index"
    u_url = f"https://cdn.aerynos.dev/main/history/{unstable_history}/x86_64/stone.index"

    volatile_packages = parse_stone_index(libzstd, v_url)
    unstable_packages = parse_stone_index(libzstd, u_url)

    v_set = set(volatile_packages)
    u_set = set(unstable_packages)

    # A truncated download or format change would decode to a handful of names.
    # Better to fail (and keep the committed file) than to mark everything recipe-only.
    for label, names in (("volatile", volatile_packages), ("unstable", unstable_packages)):
        if len(names) < MIN_PACKAGES:
            print(f"Only {len(names)} {label} packages parsed (expected >= {MIN_PACKAGES}); keeping existing channels.json.", file=sys.stderr)
            sys.exit(1)

    output = {
        "volatileHistory": volatile_history,
        "unstableHistory": unstable_history,
        "volatileTotal": len(volatile_packages),
        "unstableTotal": len(unstable_packages),
        "volatileOnlyCount": len(v_set - u_set),
        "unstableOnlyCount": len(u_set - v_set),
        "bothCount": len(v_set & u_set),
        "volatilePackages": volatile_packages,
        "unstablePackages": unstable_packages
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # Only touch the file when the content changed, so the daily job doesn't commit noise.
    # generatedAt is kept from the old file when nothing else differs.
    now = datetime.now(timezone.utc).isoformat()
    try:
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            old = json.load(f)
    except (OSError, ValueError):
        old = None
    if old and {k: v for k, v in old.items() if k != "generatedAt"} == output:
        print("channels.json unchanged.")
        return
    output = {"generatedAt": now, **output}

    tmp = OUTPUT_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
        f.write("\n")
    os.replace(tmp, OUTPUT_FILE)

    elapsed = time.time() - start
    print(f"Successfully generated {OUTPUT_FILE} in {elapsed:.2f}s:")
    print(f"  Volatile packages : {len(volatile_packages)}")
    print(f"  Unstable packages : {len(unstable_packages)}")
    print(f"  Volatile-only     : {len(v_set - u_set)}")
    print(f"  Unstable-only     : {len(u_set - v_set)}")

if __name__ == "__main__":
    main()
