---
name: ctf-reverse-anti-analysis
description: "CTF anti-analysis bypass. Linux anti-debug (ptrace, /proc, timing, SIGILL), Windows anti-debug (PEB, NtQuery, TLS callbacks, hardware BP detection), anti-VM/sandbox detection, Frida detection bypass, code integrity bypass, anti-disassembly, MBA simplification. Triggers: 'anti-debug', 'anti-analysis', 'ptrace bypass', 'debugger detection', 'anti-vm', 'tls callbacks', 'self-hash bypass', 'mba simplification', 'ld_preload hook'."
---

# CTF Reverse — Anti-Analysis Bypass

Linux/Windows anti-debug, anti-VM, Frida detection, self-hashing, MBA.

---

## Phase 1: Linux Anti-Debug

```bash
strings ./binary | grep -iE "ptrace|TracerPid|proc/self|clock_gettime|gettimeofday|alarm"
objdump -d ./binary | grep -A2 "call.*ptrace"

# 1. LD_PRELOAD hook:
cat > hook.c << 'EOF'
#include <sys/ptrace.h>
long ptrace(enum __ptrace_request r, ...) { return 0; }
EOF
gcc -shared -fPIC -o hook.so hook.c
LD_PRELOAD=./hook.so ./binary

# 2. GDB: catch and zero rax:
gdb ./binary
(gdb) catch syscall ptrace
(gdb) commands
> silent
> set $rax = 0
> continue
> end
(gdb) run

# 3. pwntools patch:
python3 -c "
from pwn import *
elf = ELF('./binary', checksec=False)
elf.asm(elf.symbols.ptrace if 'ptrace' in elf.symbols else 0x401234, 'xor eax, eax; ret')
elf.save('patched')
"

# /proc/self/status TracerPid bypass:
unshare -m bash -c 'mount --bind /dev/null /proc/self/status && ./binary'

(gdb) handle SIGALRM ignore

```

---

## Phase 2: Windows Anti-Debug (x64dbg)

```text
# ScyllaHide plugin — auto-patches all common checks:
# x64dbg → Plugins → ScyllaHide → Enable All
# Patches: PEB.BeingDebugged, NtGlobalFlag, ProcessDebugPort, TLS callbacks

# Manual PEB patches (in memory view):
# PEB.BeingDebugged offset 0x002: set to 0x00
# PEB.NtGlobalFlag offset 0x0BC (64-bit): clear bits

# TLS callbacks — run BEFORE main:
# Options → Events → TLS Callbacks: check "Break on TLS Callbacks"
# Set breakpoint on TLS callback, patch IsDebuggerPresent call

# Hardware breakpoints (don't trigger INT3 scanning):
# x64dbg: Debug → Hardware Breakpoints → Set (instead of F2)
# Use DR0-DR3 registers — code bytes unchanged

# NtSetInformationThread (ThreadHideFromDebugger):
# Hook at ntdll: hook NtSetInformationThread, skip class 0x11 calls

# Heap flags (anti-debug via heap):
# Patch: PEB.ProcessHeap → Flags field, force to 0x02
```

---

## Phase 3: Anti-VM Detection

```bash
strings ./binary | grep -iE "vmware|virtualbox|vbox|qemu|hypervisor|cpuid|rdtsc"

# VMware: network adapter settings → custom MAC

reg delete "HKLM\SOFTWARE\VMware, Inc." /f 2>nul

dmesg | grep -i "hypervisor"  # find what's leaking

```

---

## Phase 4: Frida Detection Bypass

```javascript
// Anti-Frida: hook the detection functions themselves

// Bypass strstr check for "frida" in /proc/self/maps:
Interceptor.attach(Module.findExportByName(null, "strstr"), {
    onEnter(args) {
        this.needle = Memory.readUtf8String(args[1]);
    },
    onLeave(retval) {
        if (this.needle && (this.needle.includes("frida") || 
            this.needle.includes("gadget") || this.needle.includes("gmain"))) {
            retval.replace(ptr(0));  // Return NULL = not found
        }
    }
});

// Bypass fopen("/proc/self/maps") → return fake content:
Interceptor.attach(Module.findExportByName(null, "fopen"), {
    onEnter(args) {
        var path = Memory.readUtf8String(args[0]);
        if (path && path.includes("/proc/self/maps")) {
            this.isMaps = true;
        }
    }
});

// Bypass port 27042 check (Frida default port):
Interceptor.attach(Module.findExportByName(null, "connect"), {
    onEnter(args) {
        // Read sockaddr, if port 27042 → fail the connect
        var port = Memory.readU16(args[1].add(2)) ;
        if (((port & 0xFF) << 8 | (port >> 8)) == 27042) {
            this.kill = true;
        }
    },
    onLeave(retval) {
        if (this.kill) retval.replace(ptr(-1));  // ECONNREFUSED
    }
});
```

---

## Phase 5: Code Integrity (Self-Hash) Bypass

```bash

(gdb) hbreak *0x401234  # hardware breakpoint

objdump -d ./binary | grep -A10 "call.*crc32\|call.*sha256"

python3 -c "
from pwn import *
elf = ELF('./binary', checksec=False)

elf.asm(COMPARISON_ADDR, 'xor eax, eax')  # set eax=0 before jne
elf.save('patched')
"

```

---

## Phase 6: Anti-Disassembly Bypass

```bash

(gdb) handle SIGILL nostop pass
(gdb) handle SIGSEGV nostop pass
(gdb) run
```

---

## Phase 7: MBA Simplification

```bash

# (x & y) + (x | y) == x + y
# (x ^ y) + 2*(x & y) == x + y
# (x | y) - (x & ~y) == y

pip install simba-simplifier --break-system-packages
python3 -c "from simba import simplify_mba; print(simplify_mba('(a | b) + (a & b)'))"

from z3 import *
a, b = BitVecs('a b', 64)

s = Solver()
expr1 = (a | b) + (a & b)
expr2 = a + b
s.add(expr1 != expr2)
print("Equivalent:" if s.check() == unsat else "Not equivalent")
```

---

## Phase 8: Universal Bypass Checklist

```bash
strings ./binary | grep -iE "ptrace|debug|tracerpid|vmware|vbox|cpuid|alarm|signal"
ltrace ./binary 2>&1 | head -50
strace ./binary 2>&1 | head -50

qemu-x86_64 -g 1234 ./binary  # no debugger detection

# /proc/self/status → mount namespace
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `hook.so` — LD_PRELOAD bypass library
- `patched` — patched binary with checks removed
- `flag.txt` — captured flag

## Next Phase

→ `ctf-reverse-dynamic` for dynamic analysis tools
→ `ctf-reverse-patterns` for CTF-specific reverse patterns
