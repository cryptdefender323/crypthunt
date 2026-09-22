---
name: ctf-reverse-tools
description: "CTF reverse engineering tools. GDB/pwndbg, Radare2/Cutter, Ghidra, Binary Ninja, dogbolt.org multi-decompiler, Unicorn emulation, FLIRT signatures, angr symbolic execution. Triggers: 'reverse engineering tools', 'ghidra', 'radare2', 'gdb pwndbg', 'decompiler', 'binary analysis', 'ctf re tools', 'disassembler', 'angr', 'unicorn emulation', 'binary ninja'."
---

# CTF — Reverse Engineering Tools

GDB/pwndbg, Radare2, Ghidra, Binary Ninja, Unicorn, angr, dogbolt.org.

## Install

```bash
apt-get install -y gdb gdb-multiarch
pip install pwndbg --break-system-packages

apt-get install -y radare2

pip install unicorn capstone angr pwntools --break-system-packages
```

---

## Phase 1: GDB / pwndbg Workflow

```bash
BINARY="./challenge"
gdb -q "$BINARY"

(gdb) start          # run to main
(gdb) context        # show registers, stack, code, backtrace
(gdb) nextcall       # step to next call
(gdb) plt            # list PLT entries
(gdb) got            # list GOT entries
(gdb) heap           # heap info (pwndbg)
(gdb) vis_heap_chunks  # visualize heap

(gdb) break main
(gdb) break *0x401234    # address breakpoint
(gdb) break strcmp       # libc function

(gdb) x/20gx $rsp        # 20 qwords from RSP
(gdb) x/s $rdi           # string at RDI
(gdb) x/10i $rip         # 10 instructions from RIP

(gdb) info registers
(gdb) p $rax
(gdb) set $rax = 0       # modify register

(gdb) dump binary memory dump.bin 0x400000 0x401000
```

---

## Phase 2: Radare2 / Cutter

```bash
BINARY="./challenge"

r2 -A "$BINARY"   # auto-analyze

# /x deadbeef  - search for hex pattern
# /c jmp       - search for instruction

# (arrows to navigate, tab to switch)

python3 << 'EOF'
import r2pipe

r2 = r2pipe.open("./challenge")
r2.cmd("aa")
print(r2.cmdj("afl"))   # function list as JSON
print(r2.cmd("pdf @main"))
r2.quit()
EOF
```

---

## Phase 3: Ghidra (Static Decompiler)

```bash
./ghidra_*/support/analyzeHeadless /tmp/ghidra_proj MyProject \
  -import ./challenge -postScript PrintAST.java

./ghidra_*/support/analyzeHeadless /tmp/proj MyProj \
  -import ./challenge \
  -postScript ./decompile_all.py 2>/dev/null

```

---

## Phase 4: dogbolt.org (Online Multi-Decompiler)

```bash

curl -s -X POST "https://dogbolt.org/api/binaries/" \
  -F "file=@./challenge" | jq .id

curl -s "https://dogbolt.org/api/binaries/$ID/decompilations/" | jq .
```

---

## Phase 5: Unicorn Emulation

```python
from unicorn import *
from unicorn.x86_const import *
from capstone import *

CODE_ADDR = 0x400000
STACK_ADDR = 0x7fff0000
STACK_SIZE = 0x10000
CODE_SIZE = 0x10000

# Load shellcode or function bytes:
code = open("shellcode.bin", "rb").read()

mu = Uc(UC_ARCH_X86, UC_MODE_64)
mu.mem_map(CODE_ADDR, CODE_SIZE)
mu.mem_map(STACK_ADDR - STACK_SIZE, STACK_SIZE)

mu.mem_write(CODE_ADDR, code)
mu.reg_write(UC_X86_REG_RSP, STACK_ADDR)
mu.reg_write(UC_X86_REG_RIP, CODE_ADDR)

# Trace instructions:
def hook_code(mu, addr, size, user_data):
    code = mu.mem_read(addr, size)
    md = Cs(CS_ARCH_X86, CS_MODE_64)
    for insn in md.disasm(bytes(code), addr):
        print(f"0x{insn.address:x}: {insn.mnemonic} {insn.op_str}")

mu.hook_add(UC_HOOK_CODE, hook_code)

# Emulate:
try:
    mu.emu_start(CODE_ADDR, CODE_ADDR + len(code))
except UcError as e:
    print(f"Error: {e}")

# Read result:
result = mu.reg_read(UC_X86_REG_RAX)
print(f"RAX = {result:#x}")
```

---

## Phase 6: angr Symbolic Execution

```python
import angr

proj = angr.Project("./challenge", load_options={'auto_load_libs': False})

# Find path to "win" condition:
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)

WIN_ADDR = 0x401234    # address to reach
AVOID_ADDR = 0x401500  # address to avoid (bad output)

simgr.explore(find=WIN_ADDR, avoid=[AVOID_ADDR])

if simgr.found:
    found = simgr.found[0]
    stdin = found.posix.stdin.concretize()
    print("Input to reach target:", stdin)
else:
    print("No solution found")

# For string input:
state = proj.factory.entry_state(
    stdin=angr.SimFile('/dev/stdin', content=angr.SimBytes(size=20))
)
```

---

## Phase 7: FLIRT Signature Matching

```bash

r2 -A ./challenge

signsrch -e ./challenge
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `decompiled.c` — Ghidra/BinaryNinja decompilation
- `disasm.txt` — disassembly listing
- `solution.py` — angr/unicorn solution script
- `flag.txt` — extracted flag

## Next Phase

→ `ctf-reverse-patterns` for specific RE attack patterns
→ `ctf-pwn-basics` if binary exploitation needed
