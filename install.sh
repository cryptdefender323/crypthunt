#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/cryptdefender323/crypthunt"
INSTALL_DIR="$HOME/.crypthunter"
BIN_DIR="$HOME/.local/bin"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { printf "${CYAN}[*]${NC} %s\n" "$*"; }
success() { printf "${GREEN}[✓]${NC} %s\n" "$*"; }
warn()    { printf "${YELLOW}[!]${NC} %s\n" "$*"; }
error()   { printf "${RED}[✗]${NC} %s\n" "$*"; exit 1; }

printf "\n"
printf "${BOLD}  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗${NC}\n"
printf "${BOLD}  ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝${NC}\n"
printf "${BOLD}  ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ${NC}\n"
printf "${BOLD}  ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ${NC}\n"
printf "${BOLD}  ╚██████╗██║  ██║   ██║   ██║         ██║   ${NC}\n"
printf "${BOLD}   ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝         ╚═╝  ${NC}\n"
printf "  ${CYAN}HUNTER${NC}\n\n"
printf "  ${BOLD}Autonomous Security Intelligence Engine${NC}\n\n"

# ─── helpers ────────────────────────────────────────────────────────────────

check_command() { command -v "$1" >/dev/null 2>&1; }

os_name() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux)  echo "linux" ;;
    *)      echo "unknown" ;;
  esac
}

add_to_path_in_rc() {
  local dir="$1"
  local added=0
  for rc in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [ -f "$rc" ] && ! grep -qF "$dir" "$rc" 2>/dev/null; then
      printf '\nexport PATH="%s:$PATH"\n' "$dir" >> "$rc"
      info "Added $dir to $rc"
      added=1
    fi
  done
  local fish_cfg="$HOME/.config/fish/config.fish"
  if [ -f "$fish_cfg" ] && ! grep -qF "$dir" "$fish_cfg" 2>/dev/null; then
    printf '\nset -gx PATH "%s" $PATH\n' "$dir" >> "$fish_cfg"
    info "Added $dir to $fish_cfg"
    added=1
  fi
  if [ "$added" -eq 0 ] && ! grep -qF "$dir" "$HOME/.profile" 2>/dev/null; then
    printf '\nexport PATH="%s:$PATH"\n' "$dir" >> "$HOME/.profile"
    info "Added $dir to ~/.profile"
  fi
}

add_bun_to_path() {
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
}

# ─── install Node.js ─────────────────────────────────────────────────────────

install_node() {
  info "Installing Node.js 22..."
  if check_command brew; then
    brew install node >/dev/null 2>&1
  elif check_command apt-get; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
    sudo apt-get install -y nodejs >/dev/null 2>&1
  elif check_command yum; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
    sudo yum install -y nodejs >/dev/null 2>&1
  elif check_command pacman; then
    sudo pacman -S --noconfirm nodejs npm >/dev/null 2>&1
  elif check_command dnf; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
    sudo dnf install -y nodejs >/dev/null 2>&1
  else
    error "Cannot auto-install Node.js. Install manually: https://nodejs.org"
  fi
}

# ─── install Bun ─────────────────────────────────────────────────────────────

install_bun() {
  info "Installing Bun..."
  if check_command brew; then
    brew install bun >/dev/null 2>&1
  else
    curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1 \
      || error "Failed to install Bun. Visit https://bun.sh"
  fi
  add_bun_to_path
}

# ─── install Git ─────────────────────────────────────────────────────────────

install_git() {
  info "Installing Git..."
  if check_command brew; then
    brew install git >/dev/null 2>&1
  elif check_command apt-get; then
    sudo apt-get install -y git >/dev/null 2>&1
  elif check_command yum; then
    sudo yum install -y git >/dev/null 2>&1
  elif check_command pacman; then
    sudo pacman -S --noconfirm git >/dev/null 2>&1
  elif check_command dnf; then
    sudo dnf install -y git >/dev/null 2>&1
  else
    error "Cannot auto-install Git. Install manually: https://git-scm.com"
  fi
}

# ─── install OpenCode ────────────────────────────────────────────────────────

install_opencode() {
  info "Installing OpenCode..."
  npm install -g opencode-ai --allow-scripts 2>/dev/null \
    || npm install -g opencode-ai --allow-scripts \
    || error "Failed to install OpenCode. Try: npm install -g opencode-ai --allow-scripts"
}

# ─── check requirements ──────────────────────────────────────────────────────

info "Checking requirements..."

if ! check_command node; then
  warn "Node.js not found — installing..."
  install_node
fi

NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [ "${NODE_MAJOR:-0}" -lt 18 ]; then
  warn "Node.js $(node --version) is too old — upgrading to 22..."
  install_node
fi
success "Node.js $(node --version)"

if ! check_command bun; then
  warn "Bun not found — installing..."
  install_bun
else
  add_bun_to_path
fi
success "Bun $(bun --version)"

if ! check_command git; then
  warn "Git not found — installing..."
  install_git
fi
success "Git $(git --version | awk '{print $3}')"

if ! check_command opencode; then
  install_opencode
fi
success "OpenCode $(opencode --version 2>/dev/null || echo 'installed')"

# ─── clone / update repo ─────────────────────────────────────────────────────

info "Installing CryptHunter..."

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Updating existing installation..."
  git -C "$INSTALL_DIR" pull --quiet --ff-only origin main 2>/dev/null \
    || git -C "$INSTALL_DIR" fetch --quiet origin main 2>/dev/null \
    || warn "Could not pull latest — using existing version"
else
  [ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
  info "Cloning repository..."
  git clone --quiet --depth=1 "$REPO" "$INSTALL_DIR" \
    || error "Failed to clone repository. Check your internet connection."
fi

# ─── create launcher ─────────────────────────────────────────────────────────

mkdir -p "$BIN_DIR"

# Symlink bin/crypthunter.js — node shim auto-builds on first run
ln -sf "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/crypthunter"
chmod +x "$INSTALL_DIR/bin/crypthunter.js"

# Also link 'ch' shortcut
ln -sf "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/ch"

add_to_path_in_rc "$BIN_DIR"
export PATH="$BIN_DIR:$PATH"

success "Launcher created at $BIN_DIR/crypthunter"

# ─── register plugin with OpenCode ───────────────────────────────────────────

register_plugin() {
  local plugin_entry="file://$INSTALL_DIR/bin/crypthunter.js"
  local config_dir="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
  local config_file="$config_dir/opencode.jsonc"

  mkdir -p "$config_dir"

  if [ ! -f "$config_file" ]; then
    cat > "$config_file" << EOF
{
  "plugin": ["$plugin_entry"],
  "\$schema": "https://opencode.ai/config.json"
}
EOF
    return 0
  fi

  # Config exists — update plugin entry via node (already installed)
  node - "$config_file" "$plugin_entry" << 'JS'
const fs = require("fs");
const path = process.argv[2];
const entry = process.argv[3];

let content = fs.readFileSync(path, "utf8");

// Strip existing crypthunter / oh-my-open-pentest plugin entries
const pluginRe = /"plugin"\s*:\s*\[([^\]]*)\]/s;
const match = content.match(pluginRe);
if (match) {
  const items = match[1]
    .split(",")
    .map(s => s.trim().replace(/^"|"$/g, ""))
    .filter(s => s && !s.includes("crypthunter") && !s.includes("oh-my-open-pentest") && !s.includes(".crypthunter"));
  items.push(entry);
  const formatted = items.map(s => `"${s}"`).join(", ");
  content = content.replace(pluginRe, `"plugin": [${formatted}]`);
} else {
  // No plugin key — inject after first {
  content = content.replace(/(\{)/, `$1\n  "plugin": ["${entry}"],`);
}

fs.writeFileSync(path, content);
JS
}

info "Registering CryptHunter plugin with OpenCode..."
register_plugin && success "Plugin registered" \
  || warn "Could not auto-register plugin — run: crypthunter install"

# ─── pre-build in background (speeds up first launch) ────────────────────────

if ! [ -f "$INSTALL_DIR/dist/cli/index.js" ]; then
  info "Pre-building CryptHunter (this runs in background)..."
  (
    cd "$INSTALL_DIR"
    bun install --silent 2>/dev/null && bun run build 2>/dev/null
  ) &
  PRE_BUILD_PID=$!
  info "Build running in background (PID $PRE_BUILD_PID) — first launch may take a moment"
fi

# ─── done ────────────────────────────────────────────────────────────────────

printf "\n"
success "CryptHunter installed!"
printf "\n"
printf "  ${BOLD}Next:${NC}\n\n"
printf "  1. Reload your shell:\n"
printf "       ${CYAN}exec \$SHELL${NC}\n\n"
printf "  2. Setup your AI provider (Claude / OpenAI / Gemini / Copilot):\n"
printf "       ${CYAN}crypthunter install${NC}\n\n"
printf "  3. Launch:\n"
printf "       ${CYAN}opencode${NC}\n\n"
printf "  Agents appear automatically:\n"
printf "     ${BOLD}Cerberus${NC}  main orchestrator\n"
printf "     ${BOLD}Scylla${NC}    deep autonomous worker\n"
printf "     ${BOLD}Talos${NC}     strategic planner\n"
printf "     ${BOLD}Argus${NC}     todo executor\n\n"
printf "  Quick start:\n"
printf "     ${CYAN}fullscan https://target.example.com${NC}\n"
printf "     ${CYAN}/mode ctf${NC}\n"
printf "     ${CYAN}/mode red-team${NC}\n\n"
