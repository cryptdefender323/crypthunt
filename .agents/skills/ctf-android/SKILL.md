---
name: ctf-android
description: "CTF Android challenge analysis. APK static analysis with Jadx and APKTool, smali disassembly for flag validation logic, native library JNI reverse engineering with Radare2, ADB dynamic analysis with exported activity launch and content provider query, Frida dynamic instrumentation for method hooking and return value patching, smali patching to bypass flag checks, React Native JS bundle extraction, root detection bypass, SharedPreferences and SQLite flag recovery. Triggers: 'android ctf', 'apk reverse engineering', 'jadx decompile', 'apktool smali', 'frida android', 'adb ctf', 'android frida hook', 'apk flag', 'smali patch', 'android native jni', 'react native apk'."
---

# CTF Android — APK Reverse Engineering

Jadx, APKTool, ADB, Frida. Full static+dynamic workflow.

## Install

```bash
wget https://github.com/skylot/jadx/releases/latest/download/jadx-1.5.0.zip
unzip jadx-1.5.0.zip -d jadx && echo "export PATH=$PATH:$PWD/jadx/bin" >> ~/.bashrc

wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool
wget https://github.com/iBotPeaches/Apktool/releases/latest/download/apktool_2.9.3.jar
chmod +x apktool && sudo mv apktool /usr/local/bin/ && sudo mv apktool_2.9.3.jar /usr/local/bin/apktool.jar

sudo apt-get install adb

pip install frida-tools --break-system-packages

```

---

## Phase 1: Reconnaissance

```bash
unzip challenge.apk -d apk_contents/
ls apk_contents/  # AndroidManifest.xml, classes.dex, lib/, assets/, res/

apktool d challenge.apk -o apk_decoded/
cat apk_decoded/AndroidManifest.xml | grep -E "exported|Activity|Provider|Receiver"

strings apk_contents/classes.dex | grep -i "flag\|secret\|pass\|key\|encrypt"

find apk_contents/assets/ -type f | xargs strings | grep -i "flag\|CTF"
cat apk_decoded/res/values/strings.xml | grep -i "flag\|secret"
```

---

## Phase 2: Static Analysis with Jadx

```bash
jadx -d jadx_out/ challenge.apk

grep -r "flag\|Flag\|FLAG" jadx_out/sources/ --include="*.java"
grep -r "checkFlag\|verify\|validate\|password" jadx_out/sources/ --include="*.java"

grep -r "AES\|DES\|Base64\|SecretKeySpec\|Cipher" jadx_out/sources/ --include="*.java"

grep -r "BuildConfig\|const String" jadx_out/sources/ --include="*.java"
grep -r "SharedPreferences\|openDatabase\|SQLite" jadx_out/sources/ --include="*.java"

grep -r "native \|System.loadLibrary\|loadLibrary" jadx_out/sources/ --include="*.java"
```

---

## Phase 3: Smali Analysis

```bash
apktool d challenge.apk -o smali_out/

grep -r "onCreate\|onStart" smali_out/smali/ | head -10

cat smali_out/smali/com/ctf/challenge/FlagChecker.smali

grep -n "if-eqz\|if-nez\|equals\|const-string" smali_out/smali/com/ctf/challenge/*.smali
```

---

## Phase 4: Native Library Analysis

```bash
LIB="apk_contents/lib/x86_64/libchallenge.so"  # or armeabi-v7a, arm64-v8a

strings "$LIB" | grep -i "flag\|secret\|CTF"
nm -D "$LIB" | grep "Java_"  # JNI function exports

r2 "$LIB" -A

objdump -s -j .rodata "$LIB" | head -50
```

---

## Phase 5: Dynamic Analysis with ADB

```bash

adb install challenge.apk

adb shell am start -n com.ctf.challenge/.FlagActivity
adb shell am start -n "com.ctf.challenge/com.ctf.challenge.MainActivity"

adb shell content query --uri "content://com.ctf.challenge.provider/flags"
adb shell content query --uri "content://com.ctf.challenge/data" --projection "*"

adb shell am broadcast -a com.ctf.challenge.GET_FLAG

adb logcat | grep -i "flag\|ctf\|secret\|error"
adb logcat com.ctf.challenge:D *:S

adb shell run-as com.ctf.challenge cp /data/data/com.ctf.challenge/databases/app.db /sdcard/
adb pull /sdcard/app.db
sqlite3 app.db ".tables"
sqlite3 app.db "SELECT * FROM flags;"

adb shell run-as com.ctf.challenge cat /data/data/com.ctf.challenge/shared_prefs/prefs.xml
```

---

## Phase 6: Frida Dynamic Instrumentation

```bash
adb shell /data/local/tmp/frida-server &

frida-ps -U | grep ctf

frida -U -f com.ctf.challenge -l hook.js --no-pause
```

```javascript
// hook.js — Hook String.equals to see flag comparison:
Java.perform(function() {
    Java.use('java.lang.String').equals.implementation = function(other) {
        const result = this.equals(other);
        if (this.toString().includes('CTF') || (other && other.toString().includes('CTF'))) {
            console.log('[+] String.equals: "' + this + '" vs "' + other + '" => ' + result);
        }
        return result;
    };
});

// Hook checkFlag method:
Java.perform(function() {
    const FlagChecker = Java.use('com.ctf.challenge.FlagChecker');
    FlagChecker.checkFlag.implementation = function(input) {
        console.log('[+] checkFlag called with: ' + input);
        const result = this.checkFlag(input);
        console.log('[+] checkFlag returned: ' + result);
        return true;  // Always return true (bypass)
    };
});

// Dump all method calls:
Java.perform(function() {
    Java.enumerateLoadedClasses({
        onMatch: function(name) {
            if (name.includes('ctf')) {
                try {
                    const cls = Java.use(name);
                    // Hook all methods
                } catch(e) {}
            }
        },
        onComplete: function() {}
    });
});

// Hook native function:
Interceptor.attach(Module.findExportByName('libchallenge.so', 'Java_com_ctf_challenge_FlagChecker_checkNative'), {
    onEnter: function(args) {
        console.log('[+] Native checkNative args:', args[2]);  // JNIEnv, jclass, actual_arg
    },
    onLeave: function(retval) {
        console.log('[+] Native return:', retval);
        retval.replace(1);  // Force return true (jboolean = 1)
    }
});
```

---

## Phase 7: Smali Patching

```bash
nano smali_out/smali/com/ctf/challenge/FlagChecker.smali

apktool b smali_out/ -o challenge_patched.apk

keytool -genkey -v -keystore debug.keystore -alias debug -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Debug"

apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
    --out challenge_patched_signed.apk challenge_patched.apk

adb install -r challenge_patched_signed.apk
```

---

## Phase 8: React Native / Special Cases

```bash
find apk_contents/ -name "*.bundle" -o -name "index.android.bundle"
cat apk_contents/assets/index.android.bundle | grep -i "flag\|secret"

node -e "
const code = require('fs').readFileSync('index.android.bundle', 'utf8');
// Find flag-related function:
const match = code.match(/function[^{]+\{[^}]*flag[^}]*\}/gi);
console.log(match);
"

Java.perform(function() {
    // Bypass common root checks:
    const RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    RootBeer.isRooted.implementation = function() { return false; };
    RootBeer.isRootedWithBusyBoxCheck.implementation = function() { return false; };

    // Generic file check bypass:
    const File = Java.use('java.io.File');
    File.exists.implementation = function() {
        const path = this.getAbsolutePath();
        if (path.includes('su') || path.includes('magisk')) return false;
        return this.exists();
    };
});
```

---

## Output

Save to `.omop/engagement/ctf/android/`:
- `hook.js` — Frida hook script
- `analysis.txt` — key findings
- `flag.txt` — captured flag

## Next Phase

→ `ctf-reverse-patterns-ctf` for native binary analysis
→ `ctf-wasm` for WebAssembly challenges
