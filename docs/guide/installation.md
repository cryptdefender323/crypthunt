# CryptHunter — Installation Guide

CryptHunter runs as an OpenCode plugin. Install from source — package belum dipublish ke npm.

---

## Prerequisites

| Requirement | Minimum | Check |
|---|---|---|
| Node.js | 22+ | `node --version` |
| Bun | 1.3+ | `bun --version` |
| Git | Any | `git --version` |

---

## macOS

```bash
# Install Node.js
brew install node@22 go python3 tmux git
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.zshrc

# Install OpenCode
npm install -g opencode-ai --allow-scripts

# Clone dan build CryptHunter
git clone https://github.com/cryptdefender323/crypthunter.git
cd crypthunter
bun install
bun run build

# Jalankan installer
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

The plugin installer quietly checks and installs the README-listed Go/Python
security tools and Nuclei templates. Existing tools and template directories
are reused. Run `crypthunter tools bootstrap` to retry or
`crypthunter tools bootstrap --dry-run` to preview missing dependencies.

OpenCode automatically registers the Playwright MCP server. Its browser opens
visibly when a browser skill uses it, and Playwright downloads its browser on
first use. To keep your own server settings, configure a server named
`playwright` before starting OpenCode. To disable CryptHunter's default,
configure `disabled_mcps: ["playwright"]` in `crypthunter.jsonc` for V1 or set
`mcp.servers.playwright.disabled` to `true` in `opencode.json` for V2.

---

## Kali Linux / Parrot OS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs golang-go python3-pip tmux git

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install OpenCode
npm install -g opencode-ai --allow-scripts

# Clone dan build CryptHunter
git clone https://github.com/cryptdefender323/crypthunter.git
cd crypthunter
bun install
bun run build

# Jalankan installer
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

The plugin installer quietly checks and installs the README-listed Go/Python
security tools and Nuclei templates. Existing tools and template directories
are reused. On distributions using apt, missing documented system packages
are installed through apt when non-interactive elevation is available.

---

## Ubuntu / Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs golang-go python3-pip tmux git

npm install -g opencode-ai --allow-scripts
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc


git clone https://github.com/cryptdefender323/crypthunter.git
cd crypthunter
bun install
bun run build
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

---

During installation, the Ubuntu/Debian bundle checks Nmap, SQLMap, Hashcat,
John, GDB, and the documented Python packages. Missing Python tools and Nuclei
templates are stored in the CryptHunter tools directory. System packages stay
managed by apt. If non-interactive `sudo` is unavailable, missing system
packages are recorded for later setup instead of prompting during bootstrap.

---

## iSH Shell on iPhone/iPad

CryptHunter does not run natively inside iSH. iSH provides a 32-bit x86 Alpine
environment; CryptHunter's OpenCode and Bun runtime requires a supported
64-bit macOS/Linux host. Use iSH as an SSH terminal to a Mac or Linux computer
that already has CryptHunter installed. The plugin, browser automation, and
security tools execute on that host.

Enable Remote Login on macOS (**System Settings → General → Sharing → Remote
Login**) or enable an SSH server on Linux. In iSH, install the SSH client and
connect to the host:

```sh
apk update
apk add openssh-client
ssh your-user@your-host
```

Then launch OpenCode from the remote CryptHunter checkout:

```sh
cd /path/to/crypthunt
opencode
```

Keep provider credentials on the remote host. Use SSH only over a trusted
network or private VPN, and verify the host key on first connection. Do not
expose OpenCode or CryptHunter directly to the public internet for mobile
access.

For direct local installation on a computer, follow the macOS or Linux steps
above instead.

---

## Docker (Isolated / Air-Gapped)

```bash
git clone https://github.com/cryptdefender323/crypthunter.git
cd crypthunter

docker build -f .devcontainer/Dockerfile -t crypthunter-dev .

docker run -it --rm \
  -v "$(pwd)":/workspace \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  crypthunter-dev bash
```

Inside the container:

```bash
bun install
bun run build
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

---

## Phantom C2 (Red Team Engagements Only)

```bash
git clone https://github.com/cryptdefender323/phantom.git
cd phantom
make
./phantom-server --version
cp phantom-server phantom-client /usr/local/bin/
```

---

## API Keys

```bash
cp .env.example .env
```

Edit `.env` dan isi provider yang dipakai. Minimum untuk pentest/CTF:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Untuk crypto CTF math-heavy (DeepSeek R1 bagus):

```bash
DEEPSEEK_API_KEY=...
```

Untuk local tanpa API key:

```bash
OLLAMA_HOST=http://localhost:11434
```

---

## Verify

```bash
bun run dist/cli/index.js doctor
```

Expected output:

```
System     ✓  Node 22.x, Bun 1.x, Git
OpenCode   ✓  Plugin loaded
Config     ✓  Config valid
Tools      ✓  nmap, subfinder, httpx, nuclei (N/Y installed)
Models     ✓  Provider reachable
```

Fix missing tools:

```bash
bun run dist/cli/index.js tools install
```

---

## First Engagement

CTF:

```
/mode ctf
[attach binary or describe challenge]
```

Bug bounty:

```
/mode bug-bounty
Target: https://target.example.com
Scope: *.target.example.com
```

Red team:

```
/mode red-team
Target: 10.0.0.0/24
Scope: all 10.0.0.0/24
Authorization: signed RoE attached
```

---

## Uninstall

```bash
jq '.plugin = [.plugin[] | select(. != "crypthunter")]' \
  ~/.config/opencode/opencode.json > /tmp/oc.json \
  && mv /tmp/oc.json ~/.config/opencode/opencode.json

rm -f ~/.config/opencode/crypthunter.jsonc
rm -rf .omop/
```
