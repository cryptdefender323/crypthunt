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

Security tools:

```bash
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
go install github.com/projectdiscovery/katana/cmd/katana@latest
go install github.com/projectdiscovery/naabu/v2/cmd/naabu@latest
go install github.com/tomnomnom/ffuf/v2@latest
go install github.com/tomnomnom/anew@latest

pip3 install pwntools pycryptodome impacket bloodhound crackmapexec certipy-ad
```

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

Security tools:

```bash
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
go install github.com/projectdiscovery/katana/cmd/katana@latest
pip3 install pwntools pycryptodome certipy-ad impacket
```

---

## Ubuntu / Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs golang-go python3-pip tmux git

npm install -g opencode-ai --allow-scripts
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

sudo apt install -y nmap sqlmap hashcat john binutils gdb
pip3 install pwntools pycryptodome impacket certipy-ad

git clone https://github.com/cryptdefender323/crypthunter.git
cd crypthunter
bun install
bun run build
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

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
