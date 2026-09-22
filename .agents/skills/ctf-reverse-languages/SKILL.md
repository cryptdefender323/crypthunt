---
name: ctf-reverse-languages
description: "CTF reverse engineering by language. Python bytecode (dis, PyInstaller, Pyarmor), Ruby/Perl polyglot, OPAL functional, UEFI VM bytecode, Unity IL2CPP, Roblox asset versioning, Godot KeyDot, HarmonyOS ABC, Electron ASAR, Rust serde_json, Node.js runtime introspection. Triggers: 'python reversing', 'pyinstaller unpack', 'pyarmor', 'unity il2cpp', 'godot reverse', 'electron asar', 'rust reverse', 'node introspect', 'ctf language', 'bytecode analysis'."
---

# CTF Reverse — Language & Platform-Specific

Python bytecode, Unity IL2CPP, Electron, Roblox, Godot, Rust, Node.js.

---

## Phase 1: Python Bytecode

```bash
pip install decompile3 --break-system-packages
decompile3 challenge.pyc

git clone https://github.com/zrax/pycdc /opt/pycdc
cd /opt/pycdc && cmake . && make
./pycdc challenge.pyc

python3 -c "
import dis, marshal, struct

with open('challenge.pyc', 'rb') as f:
    f.read(16)  # skip header (16 bytes for py3.8+)
    code = marshal.load(f)

dis.dis(code)
"

```

```bash
pip install pyinstxtractor --break-system-packages
python3 -m pyinstxtractor ./challenge.exe

git clone https://github.com/extremecoders-re/pyinstxtractor /opt/pyinstxtractor
python3 /opt/pyinstxtractor/pyinstxtractor.py ./challenge.exe

ls challenge.exe_extracted/

python3 /opt/pyinstxtractor/pyz_extractor.py PYZ-00.pyz
decompile3 *.pyc 2>/dev/null
```

```bash
git clone https://github.com/Svenskithesource/PyArmor-Unpacker /opt/pyarmor-unpack
python3 /opt/pyarmor-unpack/unpack.py ./challenge.pyc
```

---

## Phase 2: Roblox Place File

```bash

ASSET_ID="12345678"
BASE_URL="https://assetdelivery.roblox.com/v1/asset"

curl -o current.rbxl "$BASE_URL/?id=$ASSET_ID"

curl -o v1.rbxl "$BASE_URL/?id=$ASSET_ID&version=1"

for ver in $(seq 1 20); do
  curl -so "v$ver.rbxl" "$BASE_URL/?id=$ASSET_ID&version=$ver"
done

strings v1.rbxl | grep -A5 "LocalScript\|Script" > v1_scripts.txt
strings v2.rbxl | grep -A5 "LocalScript\|Script" > v2_scripts.txt
diff v1_scripts.txt v2_scripts.txt
```

---

## Phase 3: Unity IL2CPP

```bash

git clone https://github.com/Perfare/Il2CppDumper /opt/il2cppdumper
cd /opt/il2cppdumper && dotnet build

dotnet Il2CppDumper.dll libil2cpp.so global-metadata.dat /tmp/dump

dotnet Il2CppDumper.dll libil2cpp.so global-metadata.dat /tmp/dump --key 0xKEY

ls /tmp/dump/

cat /tmp/dump/dump.cs | grep -iE "flag|password|secret|key"
```

---

## Phase 4: Godot

```bash
git clone https://github.com/bruvzg/gdsdecomp /opt/gdsdecomp

pip install godot-reverse --break-system-packages

godot_re --extract game.pck output_dir/
ls output_dir/

cat output_dir/**/*.gd | grep -i flag

git clone https://github.com/nikitalita/gdscript-godot-keydot /opt/keydot

```

---

## Phase 5: Electron ASAR

```bash

npm install -g asar 2>/dev/null || npx asar extract app.asar ./extracted
ls ./extracted/

grep -ri "flag\|ctf\|secret\|password" ./extracted/ | grep -v node_modules

find ./extracted -name "*.node" -o -name "*.so" | xargs file

```

---

## Phase 6: Node.js Runtime Introspection

```javascript
// Discover hidden methods/properties not visible in source:

// List all own + inherited properties:
function getAll(obj) {
    let props = new Set();
    while (obj) {
        Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
        obj = Object.getPrototypeOf(obj);
    }
    return [...props];
}

// Enumerate loaded modules:
console.log(Object.keys(require.cache));

// Find hidden module exports:
const mod = require('./challenge');
console.log(getAll(mod));
console.log(Object.getOwnPropertyDescriptors(mod));

// Symbol-keyed properties:
console.log(Object.getOwnPropertySymbols(mod));
```

---

## Phase 7: Rust serde_json Schema Recovery

```bash

# 1. Find strings starting with field names:
strings ./challenge | grep -E '^[a-z_]+$' | sort | uniq

# 2. In Ghidra: search for __Field enum variants

strings ./challenge | grep -B1 "expecting" | grep -v "expecting"

# 3. Construct expected JSON from field names:

```

---

## Phase 8: UEFI / DOS Stub

```bash

dosbox -c "debug CHALLENGE.EXE"

python3 << 'EOF'
with open('CHALLENGE.EXE', 'rb') as f:
    data = f.read()

import struct
pe_offset = struct.unpack('<I', data[0x3C:0x40])[0]
dos_stub = data[0x40:pe_offset]

with open('dos_stub.bin', 'wb') as f:
    f.write(dos_stub)
print(f"DOS stub: {len(dos_stub)} bytes, offset 0x40 to 0x{pe_offset:x}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `decompiled.py` / `decompiled.cs` — decompiled source
- `dump.cs` — IL2CPP dump
- `flag.txt` — found flag

## Next Phase

→ `ctf-reverse-dynamic` for dynamic analysis
→ `ctf-reverse-anti-analysis` for anti-debug bypass
