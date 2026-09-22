---
name: ctf-reverse-patterns
description: "CTF reverse engineering patterns. Custom VM analysis, anti-debug bypass, XOR known-plaintext, control flow flattening, mixed-mode execution, signal-based obfuscation, S-box/keystream identification. Triggers: 'reverse engineering', 'binary reverse', 'custom vm', 'anti debug bypass', 'xor key recovery', 'control flow flattening', 'obfuscation bypass', 'ctf reverse', 'crackme'."
---

# CTF — Reverse Engineering Patterns

Custom VMs, anti-debug, XOR key recovery, obfuscation bypass, emulation.

## Install

```bash
apt-get install -y gdb ghidra radare2
pip install pwntools unicorn capstone --break-system-packages

pip install pwndbg --break-system-packages

```

---

## Phase 1: Initial Static Analysis

```bash
BINARY="./challenge"

file "$BINARY"
checksec "$BINARY"
strings "$BINARY" | grep -iE "flag|ctf|picoctf|\{|win|key|pass|secret"
objdump -d "$BINARY" | head -200

objdump -d "$BINARY" | grep -E "switch|jump table|case"

```

---

## Phase 2: Custom VM Analysis

```bash
# 1. Identify VM internal structure:
#    - registers (often struct fields)
#    - memory region
#    - instruction pointer
#    - bytecode array

gdb -q "$BINARY"
(gdb) break *dispatch_func
(gdb) run
(gdb) display/xw opcode_var
(gdb) commands
>   continue
>   end

python3 << 'EOF'
from pwn import *

elf = ELF("./challenge")
p = process("./challenge")

EOF

python3 << 'EOF'
OPCODES = {
    0x01: "PUSH",
    0x02: "POP",
    0x03: "ADD",
    0x04: "JMP",
    # ... from reversing the dispatcher
}

bytecode = open("bytecode.bin", "rb").read()
i = 0
while i < len(bytecode):
    op = bytecode[i]
    name = OPCODES.get(op, f"UNK_{op:02x}")
    print(f"0x{i:04x}: {name}")
    i += 1  # adjust for operand sizes
EOF
```

---

## Phase 3: Anti-Debug Bypass

```bash
BINARY="./challenge"

objdump -d "$BINARY" | grep -E "ptrace|IsDebuggerPresent|NtQueryInformation"
strings "$BINARY" | grep -iE "debugger|ptrace|timing"

gdb -q "$BINARY"
(gdb) catch syscall ptrace
(gdb) commands
>   set $rax = 0   # fake success
>   continue
>   end
(gdb) run

cat > ptrace_bypass.c << 'EOF'
#include <stdio.h>
long ptrace(int request, ...) {
    return 0;
}
EOF
gcc -shared -fPIC -o ptrace_bypass.so ptrace_bypass.c
LD_PRELOAD=./ptrace_bypass.so ./challenge

python3 << 'EOF'
from pwn import *

elf = ELF("./challenge")

EOF
```

---

## Phase 4: XOR Known-Plaintext Attack

```python
# When flag format is known (e.g., "CTF{" prefix)
# XOR ciphertext with known plaintext to recover key

ciphertext = bytes.fromhex("...")  # from binary/file
known_prefix = b"CTF{"

# Try different key lengths:
for key_len in range(1, 32):
    # Derive key bytes from known plaintext:
    key_candidate = bytes([ciphertext[i] ^ known_prefix[i % len(known_prefix)]
                          for i in range(key_len)])
    
    # Decrypt with full key:
    decrypted = bytes([ciphertext[i] ^ key_candidate[i % key_len]
                      for i in range(len(ciphertext))])
    
    # Check if printable:
    if all(32 <= b <= 126 for b in decrypted):
        print(f"Key len {key_len}: key={key_candidate.hex()}, decrypted={decrypted}")

# Position-indexed XOR (cipher[i] ^= i % key_len ^ key[i % key_len]):
for key_len in range(1, 32):
    for key in range(256**key_len):
        key_bytes = key.to_bytes(key_len, 'big')
        decrypted = bytes([ciphertext[i] ^ (i % key_len) ^ key_bytes[i % key_len]
                          for i in range(len(ciphertext))])
        if decrypted.startswith(b"CTF{"):
            print(f"Found: {decrypted}")
```

---

## Phase 5: Control Flow Flattening Bypass

```bash
# 1. Identify state variable (usually assigned before each iteration)
# 2. Log state transitions with GDB:

gdb -q "$BINARY"
(gdb) break *dispatch_loop_addr
(gdb) commands
>   printf "state: %d\n", $rax
>   continue
>   end
(gdb) run

python3 << 'EOF'

import re

transitions = """
state: 0
state: 3
state: 1
state: 5
...
"""

states = [int(x.split(': ')[1]) for x in transitions.strip().split('\n')]
graph = {}
for i in range(len(states) - 1):
    graph.setdefault(states[i], []).append(states[i+1])
print(graph)
EOF
```

---

## Phase 6: Signal-Based Obfuscation

```bash

strace -e signal ./challenge
ltrace ./challenge 2>&1 | grep "signal\|sigaction"

cat > signal_log.c << 'EOF'
#include <signal.h>
#include <stdio.h>

int sigaction(int sig, const struct sigaction *act, struct sigaction *oact) {
    if (act) {
        fprintf(stderr, "[signal_log] sigaction(%d, handler=%p)\n", sig, act->sa_handler);
    }
    extern int sigaction(int, const struct sigaction*, struct sigaction*);
    return sigaction(sig, act, oact);
}
EOF
gcc -shared -fPIC -o signal_log.so signal_log.c
LD_PRELOAD=./signal_log.so ./challenge 2>signal_log.txt
```

---

## Phase 7: Mixed-Mode (x86/x86-64) Bypass

```bash

objdump -d ./challenge | grep -E "retf|ljmpq|lcallq"

python3 << 'EOF'
from unicorn import *
from unicorn.x86_const import *

mu = Uc(UC_ARCH_X86, UC_MODE_64)

EOF
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `bytecode-disasm.txt` — VM bytecode disassembly
- `key.txt` — recovered XOR key
- `flag.txt` — decrypted flag

## Next Phase

→ `ctf-reverse-tools` for tool setup
→ `ctf-pwn-rop` if exploit-based challenge
