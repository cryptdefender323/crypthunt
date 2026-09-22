---
name: ctf-reverse-tools-advanced
description: "CTF advanced reverse engineering tooling. VMProtect devirtualization, Themida unpacking, BinDiff/Diaphora patch analysis, D-810 deobfuscation, GOOMBA Ghidra, Miasm IR lifting, Qiling emulation, Triton symbolic execution, rr reverse debugging, pwndbg/GEF, LIEF binary patching. Triggers: 'vmprotect', 'themida', 'bindiff', 'binary diff', 'deobfuscation', 'qiling', 'triton', 'miasm', 'reverse debugging', 'ghidra scripting', 'pwndbg', 'lief patching', 'advanced reverse tools'."
---

# CTF Reverse — Advanced Tools & Deobfuscation

VMProtect, BinDiff, D-810, Qiling, Triton, rr, Ghidra scripting.

---

## Phase 1: VMProtect Analysis

```bash
strings ./binary | grep -i "vmp\|vmprotect"
readelf -S ./binary | grep ".vmp"  # .vmp0, .vmp1 sections

# 1. Find VM entry: pushad/pushaq-like sequences
# 2. Find handler table: large indirect jump (jmp [reg + offset])
# 3. Trace handlers: each ends with jump to next
# 4. Identify common handlers: vAdd, vSub, vXor, vPush, vPop, vJcc, vRet

```

```javascript
// Hook VM handler dispatch:
var vm_dispatch = ptr('0x...');  // handler table jump address

Interceptor.attach(vm_dispatch, {
    onEnter(args) {
        var handler_idx = this.context.rax;
        console.log('Handler:', handler_idx.toString(16),
                    'RSP:', this.context.rsp.toString(16));
    }
});
```

```bash
```

---

## Phase 2: Themida / WinLicense Unpacking

```bash

# 1. Load binary
# 2. Plugins → ScyllaHide → Profile: Themida
# 3. Run to OEP (may need several attempts)
# 4. Dump: Scylla → OEP → IAT Autosearch → Get Imports → Dump
# 5. Fix: Scylla → Fix Dump
# 6. Analyze fixed dump in Ghidra/IDA

pe-sieve.exe /pid PID /dir ./dumped
```

---

## Phase 3: Binary Diffing (Patch Analysis)

```bash
# 1. Export from IDA: File → BinExport → Export as BinExport2
# 2. Export patched binary same way
bindiff primary.BinExport secondary.BinExport

python3 << 'EOF'

import subprocess, hashlib

def get_func_hashes(binary):
    result = subprocess.run(['objdump', '-d', binary], capture_output=True, text=True)

    funcs = {}
    current = None
    for line in result.stdout.splitlines():
        if '<' in line and '>:' in line:
            current = line.split('<')[1].rstrip('>:')
            funcs[current] = []
        elif current and '\t' in line:
            parts = line.split('\t')
            if len(parts) >= 3:
                funcs[current].append(parts[2].split()[0])  # mnemonic only
    return {k: hashlib.md5(' '.join(v).encode()).hexdigest() for k, v in funcs.items()}

orig = get_func_hashes('original')
patched = get_func_hashes('patched')

for name in set(orig) | set(patched):
    if name not in orig:
        print(f"NEW: {name}")
    elif name not in patched:
        print(f"REMOVED: {name}")
    elif orig[name] != patched[name]:
        print(f"CHANGED: {name}")
EOF
```

---

## Phase 4: Deobfuscation Frameworks

```bash

pip install miasm --break-system-packages
```

```python
from miasm.analysis.binary import Container
from miasm.analysis.machine import Machine

cont = Container.from_stream(open("binary", "rb"))
machine = Machine(cont.arch)
mdis = machine.dis_engine(cont.bin_stream, loc_db=cont.loc_db)

# Disassemble function:
asmcfg = mdis.dis_multiblock(0x401000)

# Lift to IR:
lifter = machine.lifter_model_call(loc_db=cont.loc_db)
ircfg = lifter.new_ircfg_from_asmcfg(asmcfg)

# Symbolic execution + simplify:
from miasm.ir.symbexec import SymbolicExecutionEngine
sb = SymbolicExecutionEngine(lifter)
# Execute symbolically — simplify obfuscated expressions
```

---

## Phase 5: Qiling Emulation

```python
from qiling import Qiling
from qiling.const import QL_VERBOSE

# Emulate foreign-arch ELF:
ql = Qiling(["./arm_binary"], "rootfs/arm_linux",
            verbose=QL_VERBOSE.DEBUG)

# Hook specific address:
@ql.hook_address
def bypass_check(ql, address, size):
    ql.arch.regs.rax = 0  # Bypass anti-debug check

# Hook syscall:
@ql.hook_syscall(name="ptrace")
def hook_ptrace(ql, request, pid, addr, data):
    return 0  # Always succeed

# Hook Windows API:
@ql.set_api("IsDebuggerPresent", target=ql.os.user_defined_api)
def hook_isdebug(ql, address, params):
    return 0

ql.run()
```

---

## Phase 6: Triton Dynamic Symbolic Execution

```python
from triton import *

ctx = TritonContext(ARCH.X86_64)

# Symbolize input bytes:
for i in range(32):
    ctx.symbolizeMemory(MemoryAccess(INPUT_ADDR + i, CPUSIZE.BYTE), f"input_{i}")

# Emulate until comparison:
pc = ENTRY_POINT
while pc != CMP_ADDR:
    inst = Instruction(pc, bytes(ctx.getConcreteMemoryAreaValue(pc, 16)))
    ctx.processing(inst)
    pc = ctx.getConcreteRegisterValue(ctx.registers.rip)

# Extract path constraint at comparison:
ast = ctx.getPathConstraintsAst()
model = ctx.getModel(ast)
flag = ''.join(chr(model[k].getValue()) for k in sorted(model.keys()))
print(f"Flag: {flag}")
```

---

## Phase 7: rr Reverse Debugging

```bash
rr record ./binary

rr replay

(gdb) continue                  # forward
(gdb) reverse-continue          # backward to prev breakpoint
(gdb) reverse-stepi             # step backward one instruction
(gdb) reverse-next              # reverse next
(gdb) when                      # show current event number
(gdb) checkpoint                # save position
(gdb) restart 1                 # return to checkpoint 1

```

---

## Phase 8: pwndbg / Advanced GDB

```bash
git clone https://github.com/pwndbg/pwndbg && cd pwndbg && ./setup.sh

(pwndbg) context               # registers + stack + code + backtrace
(pwndbg) vmmap                 # memory map
(pwndbg) search -s "flag{"    # search memory for string
(pwndbg) telescope $rsp 20    # smart stack dump
(pwndbg) cyclic 200            # De Bruijn pattern
(pwndbg) got                   # GOT entries
(pwndbg) plt                   # PLT entries
(pwndbg) heap                  # heap chunks
(pwndbg) bins                  # heap bins

gdb -batch ./binary -ex "
b *0x401234
commands
  silent
  printf \"rdi=%s rsi=%s\\n\", (char*)\$rdi, (char*)\$rsi
  continue
end
run < input.txt
"

(gdb) watch *(int*)0x601050     # break on write
(gdb) rwatch *(int*)0x601050    # break on read
```

---

## Phase 9: Binary Patching with LIEF

```python
import lief

# Parse ELF:
binary = lief.parse("./binary")

# NOP out a check:
binary.patch_address(0x401234, [0x90] * 5)

# Patch conditional jump:
binary.patch_address(0x401234, [0x74])  # JNZ→JZ

# Add section:
section = lief.ELF.Section(".patch")
section.content = list(b"\xcc" * 0x100)
section.type = lief.ELF.SECTION_TYPES.PROGBITS
section.flags = lief.ELF.SECTION_FLAGS.EXECINSTR | lief.ELF.SECTION_FLAGS.ALLOC
binary.add(section)

# Hook imported function:
binary.patch_pltgot("strcmp", 0x401000)

binary.write("patched")
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `patched` — patched binary
- `decompiled.py` — lifted/deobfuscated code
- `flag.txt` — found flag

## Next Phase

→ `ctf-reverse-dynamic` for Frida/angr
→ `ctf-reverse-anti-analysis` for anti-debug bypass
