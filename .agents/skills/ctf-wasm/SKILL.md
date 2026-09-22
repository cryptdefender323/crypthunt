---
name: ctf-wasm
description: "CTF WebAssembly challenge analysis. Initial recon with wasm-objdump, WAT decompilation with wasm2wat, wasm-decompile pseudo-code, wasm2c native compilation for ltrace/GDB analysis, wasmtime/wasmer execution, WASM linear memory dump and string extraction, binary patching via WAT edit then wat2wasm, XOR obfuscation recovery, character-by-character comparison pattern detection, Node.js WASM runtime wrapper analysis. Triggers: 'wasm ctf', 'webassembly reverse', 'wasm2wat', 'wasm2c', 'wasmtime', 'wasm-objdump', 'wasm binary', 'wat analysis', 'webassembly decompile', 'wasm memory dump', 'wasm flag'."
---

# CTF WASM — WebAssembly Reverse Engineering

wasm-objdump → wasm2wat → wasm2c → ltrace → patch.

## Install

```bash
sudo apt-get install -y wabt  # wasm2wat, wat2wasm, wasm-objdump, wasm-interp, wasm-decompile
curl https://wasmtime.dev/install.sh -sSf | bash  # wasmtime runtime
```

---

## Phase 1: Initial Reconnaissance

```bash
file challenge.wasm          # WebAssembly (wasm) binary module
xxd challenge.wasm | head -3 # magic: 00 61 73 6D (asm)

wasm-objdump -h challenge.wasm    # section headers (type, import, func, table, mem, export, code, data)
wasm-objdump -x challenge.wasm    # full dump — exports, imports, globals

wasm-objdump -x challenge.wasm | grep "Export"
wasm-objdump -x challenge.wasm | grep "Import"

strings challenge.wasm | grep -i "flag\|CTF\|correct\|wrong\|password"
```

---

## Phase 2: Decompile to WAT

```bash
wasm2wat challenge.wasm -o challenge.wat
wc -l challenge.wat    # gauge complexity

grep -n "export" challenge.wat        # exported functions (call these)
grep -n "i32.eq\|i32.ne" challenge.wat  # comparison instructions (flag check)
grep -n "call " challenge.wat | head -20   # function calls
grep -n "data " challenge.wat        # data segments (string storage)
grep -n "loop\|br_if" challenge.wat  # loops with exit conditions

# (loop
#   (i32.eq (i32.load8_u offset=X (local.get $i)) (i32.const EXPECTED_CHAR))
#   (br_if $loop (local.tee $i (i32.add (local.get $i) (i32.const 1))))
# )

# (i32.xor (i32.load8_u ...) (i32.const KEY))
```

---

## Phase 3: Pseudo-code Decompilation

```bash
wasm-decompile challenge.wasm -o challenge.dcmp
cat challenge.dcmp

wasm2c challenge.wasm -o challenge.c
ls challenge.c challenge.h

find /usr -name "wasm-rt-impl.c" 2>/dev/null

gcc -O0 -g challenge.c /usr/share/wabt/wasm-rt-impl.c \
    -I/usr/include/wabt/ -I/usr/share/wabt/ \
    -o challenge_native -lm

ltrace ./challenge_native <<< "CTF{test_input}"
gdb ./challenge_native
objdump -d ./challenge_native | grep -A20 "w2c_check\|w2c_verify\|w2c_main"
```

---

## Phase 4: Execution and Testing

```bash
wasmtime challenge.wasm
echo "test_flag" | wasmtime challenge.wasm
wasmtime challenge.wasm -- --input "CTF{guess}"

wasm-interp challenge.wasm --run-all-exports

wasm-interp challenge.wasm --call check_flag i32:42

node << 'EOF'
const fs = require('fs');
const buf = fs.readFileSync('challenge.wasm');
WebAssembly.instantiate(buf, {
    wasi_snapshot_preview1: {
        proc_exit: () => {},
        fd_write: (fd, iovs, iovsLen, nwritten) => 0,
    },
    env: { memory: new WebAssembly.Memory({ initial: 256 }) }
}).then(({ instance }) => {
    console.log('Exports:', Object.keys(instance.exports));
    const mem = new Uint8Array(instance.exports.memory.buffer);
    // Write input to memory:
    const encoder = new TextEncoder();
    const input = encoder.encode('CTF{test_flag}\0');
    mem.set(input, 0x100);
    // Call check function with pointer to input:
    const result = instance.exports.check_flag(0x100);
    console.log('Result:', result);
});
EOF
```

---

## Phase 5: Memory Analysis

```bash
wasm-objdump -x challenge.wasm | grep -A20 "Data"

python3 << 'EOF'
data = open('challenge.wasm', 'rb').read()

def read_uleb128(data, pos):
    result = 0; shift = 0
    while True:
        b = data[pos]; pos += 1
        result |= (b & 0x7f) << shift
        if not (b & 0x80): break
        shift += 7
    return result, pos

import re
strings_found = re.findall(rb'[\x20-\x7e]{4,}', data)
for s in strings_found:
    print(s.decode())
EOF

python3 << 'EOF'

import re
wat = open('challenge.wat').read()

xor_keys = re.findall(r'i32\.xor.*?i32\.const (\d+)', wat)
print("Possible XOR keys:", xor_keys)

data_segs = re.findall(r'data \(i32\.const (\d+)\) "(.*?)"', wat)
for offset, encoded in data_segs:
    print(f"Data at {offset}: {repr(encoded)}")

    for key in xor_keys:
        try:
            raw = bytes.fromhex(encoded.replace('\\', ''))
            decrypted = bytes(b ^ int(key) for b in raw)
            if all(0x20 <= c < 0x7f for c in decrypted):
                print(f"  XOR {key} → {decrypted}")
        except: pass
EOF
```

---

## Phase 6: WASM Patching

```bash
wasm2wat challenge.wasm -o challenge.wat

sed -i 's/(i32\.ne (local\.get \$check_result) (i32\.const 1))/(i32.const 0)/' challenge.wat

wat2wasm challenge.wat -o challenge_patched.wasm
wasmtime challenge_patched.wasm <<< "anything"

python3 << 'EOF'
data = bytearray(open('challenge.wasm', 'rb').read())

offset = 0x1234  # from wasm-objdump -d output
data[offset] = 0x41  # i32.const
data[offset+1] = 0x01  # value = 1 (true)

open('challenge_patched.wasm', 'wb').write(bytes(data))
EOF
```

---

## Phase 7: Common CTF Patterns

```bash
wasm-objdump -x challenge.wasm | grep -A5 "Data"

wasm2c challenge.wasm -o c.c
gcc c.c /usr/share/wabt/wasm-rt-impl.c -I/usr/share/wabt/ -o native -lm
ltrace ./native <<< "guess"

python3 << 'EOF'
import subprocess
import string

flag = "CTF{"
chars = string.printable

while not flag.endswith('}'):
    for c in chars:
        result = subprocess.run(
            ['wasmtime', 'challenge.wasm', '--', flag + c],
            capture_output=True, text=True
        )
        if 'correct' in result.stdout.lower() or result.returncode == 0:
            flag += c
            print(f"\rFlag: {flag}", end='', flush=True)
            break
    else:
        break

print(f"\nFlag: {flag}")
EOF

```

---

## Output

Save to `.omop/engagement/ctf/wasm/`:
- `challenge.wat` — decompiled WAT
- `challenge.dcmp` — pseudo-code
- `solve.py` — solver
- `flag.txt` — recovered flag

## Next Phase

→ `ctf-misc-games-vms` for WASM game challenges
→ `ctf-reverse-patterns-ctf` for other VM challenges
