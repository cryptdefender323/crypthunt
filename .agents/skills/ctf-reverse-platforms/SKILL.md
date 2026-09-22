---
name: ctf-reverse-platforms
description: "CTF reverse engineering by platform. macOS Mach-O analysis, iOS class-dump, IoT/embedded firmware (ARM/MIPS), Linux kernel modules, eBPF programs, game engines (Unreal .pak, Unity C#), automotive CAN/UDS, RISC-V custom extensions, HD44780 LCD reconstruction. Triggers: 'macos reverse', 'ios reverse', 'mach-o', 'iot reverse', 'kernel module', 'ebpf reverse', 'unreal pak', 'can forensics', 'uds reverse', 'risc-v', 'lcd reconstruction'."
---

# CTF Reverse — Platform-Specific

macOS/iOS, IoT embedded, kernel drivers, eBPF, game engines, automotive CAN.

---

## Phase 1: macOS / iOS (Mach-O)

```bash
file ./binary
lipo -info ./binary          # fat binary: list architectures
lipo -thin x86_64 ./fat_bin -output ./x86_64_bin

class-dump ./binary -H -o ./headers/
cat ./headers/*.h | grep -iE "flag|secret|key|password"

xcrun swift-demangle 's:13ChallengeApp11ContentViewV4bodyQrvg'

lldb ./binary
(lldb) b -n "checkFlag:"       # breakpoint on ObjC method
(lldb) run
(lldb) p $rdi                  # ObjC: self in rdi
(lldb) po [$rdi description]

codesign --remove-signature ./binary

```

---

## Phase 2: IoT / Embedded Firmware

```bash
binwalk -e firmware.bin -C ./extracted/
ls ./extracted/

find ./extracted/ -name "*.elf" -o -perm /0111 2>/dev/null | xargs file 2>/dev/null | grep ELF

analyzeHeadless /tmp/ghidra_project firmware_proj \
  -import ./firmware.elf \
  -postScript PrintTree.java \
  -scriptPath /opt/ghidra-scripts

grep -r "admin\|password\|secret\|key\|token" ./extracted/ --include="*.conf" --include="*.cfg"
find ./extracted/ -name "*.sh" | xargs grep -li "passwd\|password"
```

---

## Phase 3: Linux Kernel Modules

```bash
# .ko module entry point:
objdump -d challenge.ko | grep -A20 "init_module"

objdump -T challenge.ko

objdump -d challenge.ko | grep -A5 "unlocked_ioctl"

bpftool prog list
bpftool prog dump xlated id PROG_ID
bpftool prog dump jited id PROG_ID  # JIT-compiled

bpftool prog list | grep -i "type"
```

---

## Phase 4: Game Engines

```bash
apt-get install quickbms
quickbms ue4.bms game.pak output_dir/

UnrealPak game.pak -Extract output_dir/

dnspy Assembly-CSharp.dll    # GUI IL2CPP decompiler

dotnet-decompiler Assembly-CSharp.dll --output ./csharp_src/

```

---

## Phase 5: Automotive CAN / UDS

```bash
# CAN traffic capture (hardware required):
candump can0 | tee can_log.txt

canplayer -I can_log.asc

python3 << 'EOF'
import cantools

db = cantools.database.load_file('vehicle.dbc')
msg = db.decode_message(0x123, bytes.fromhex('0102030405060708'))
print(msg)
EOF

# 0x10 = DiagnosticSessionControl
# 0x22 = ReadDataByIdentifier (DID)
# 0x27 = SecurityAccess (seed-key algorithm)
# 0x34 = RequestDownload (firmware update)

python3 << 'EOF'
import can, isotp

bus = can.Bus(channel='can0', bustype='socketcan')

bus.send(can.Message(arbitration_id=0x7DF, data=[0x02, 0x10, 0x03]))
response = bus.recv(timeout=1.0)
print(f"Response: {response}")

bus.send(can.Message(arbitration_id=0x7DF, data=[0x03, 0x22, 0xF1, 0x90]))
EOF
```

---

## Phase 6: RISC-V

```bash

objdump -d ./riscv_binary | grep "custom\|0x"

```

---

## Phase 7: HD44780 LCD Reconstruction

```python
# Pattern: GPIO sampling at fixed intervals, non-contiguous DRAM addressing
# HD44780 display has 4 display lines at non-sequential memory addresses

# Memory layout (standard 20x4):
# Line 1: 0x00 - 0x13
# Line 2: 0x40 - 0x53
# Line 3: 0x14 - 0x27
# Line 4: 0x54 - 0x67

def reconstruct_lcd_display(sampled_bytes: bytes, cols=20, rows=4):
    """Reconstruct HD44780 display from DRAM sample."""
    display = []
    offsets = [0x00, 0x40, 0x14, 0x54]  # line start addresses
    
    for row, offset in enumerate(offsets[:rows]):
        line = ''
        for col in range(cols):
            addr = offset + col
            if addr < len(sampled_bytes):
                char = sampled_bytes[addr]
                line += chr(char) if 0x20 <= char <= 0x7E else '?'
        display.append(line)
    
    return '\n'.join(display)

# Usage:
with open('dram_sample.bin', 'rb') as f:
    data = f.read()
print(reconstruct_lcd_display(data))
```

---

## Phase 8: Side-Channel (Code Coverage)

```bash

/opt/intel/pin/pin -t /opt/intel/pin/source/tools/ManualExamples/obj-intel64/inscount0.so -- ./challenge AAA 2>&1 | grep Count

python3 << 'EOF'
import subprocess

def get_inscount(input_bytes):
    result = subprocess.run(
        ['pin', '-t', 'inscount0.so', '--', './challenge'],
        input=input_bytes, capture_output=True
    )
    for line in result.stderr.decode().splitlines():
        if 'Count' in line:
            return int(line.split()[-1])
    return 0

known = b''
for pos in range(32):
    best_count = 0
    best_byte = 0
    for b in range(256):
        test = known + bytes([b]) + b'\x00' * (32 - pos - 1)
        count = get_inscount(test)
        if count > best_count:
            best_count = count
            best_byte = b
    known += bytes([best_byte])
    print(f"Position {pos}: {chr(best_byte)} (count={best_count})")

print(f"Recovered: {known}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `decompiled/` — decompiled source
- `can-decoded.txt` — CAN message analysis
- `flag.txt` — found flag

## Next Phase

→ `ctf-reverse-dynamic` for Frida/angr dynamic analysis
→ `ctf-reverse-anti-analysis` for anti-debug bypass
