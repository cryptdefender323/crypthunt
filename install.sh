#!/usr/bin/env bash
# CryptHunter installer — macOS, Linux (Kali/Debian/Ubuntu/Arch/Fedora/RHEL), Windows (Git Bash/WSL)
# Usage: curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
set -euo pipefail

REPO="https://github.com/cryptdefender323/crypthunt"
INSTALL_DIR="${CRYPTHUNTER_INSTALL_DIR:-$HOME/.crypthunter}"
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
error()   { printf "${RED}[✗]${NC} %s\n" "$*" >&2; exit 1; }

printf "\n"
printf "${BOLD}  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗${NC}\n"
printf "${BOLD}  ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝${NC}\n"
printf "${BOLD}  ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ${NC}\n"
printf "${BOLD}  ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ${NC}\n"
printf "${BOLD}  ╚██████╗██║  ██║   ██║   ██║         ██║   ${NC}\n"
printf "${BOLD}   ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝         ╚═╝  ${NC}\n"
printf "  ${CYAN}HUNTER${NC}\n\n"
printf "  ${BOLD}Autonomous Security Intelligence Engine${NC}\n\n"

# ─── platform detection ──────────────────────────────────────────────────────

check_command() { command -v "$1" >/dev/null 2>&1; }

detect_os() {
  case "$(uname -s 2>/dev/null)" in
    Darwin)  echo "macos" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then echo "wsl"; else echo "linux"; fi
      ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "linux" ;;
  esac
}

detect_pkg_manager() {
  if check_command apt-get;  then echo "apt"
  elif check_command dnf;    then echo "dnf"
  elif check_command yum;    then echo "yum"
  elif check_command pacman; then echo "pacman"
  elif check_command zypper; then echo "zypper"
  elif check_command brew;   then echo "brew"
  else echo "unknown"
  fi
}

OS=$(detect_os)
PKG=$(detect_pkg_manager)

info "Detected OS: $OS | Package manager: $PKG"

# ─── PATH helpers ─────────────────────────────────────────────────────────────

add_to_path_in_rc() {
  local dir="$1"
  for rc in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [ -f "$rc" ] && ! grep -qF "$dir" "$rc" 2>/dev/null; then
      printf '\nexport PATH="%s:$PATH"\n' "$dir" >> "$rc"
      info "Added $dir to $rc"
    fi
  done
  local fish_cfg="$HOME/.config/fish/config.fish"
  if [ -f "$fish_cfg" ] && ! grep -qF "$dir" "$fish_cfg" 2>/dev/null; then
    printf '\nset -gx PATH "%s" $PATH\n' "$dir" >> "$fish_cfg"
    info "Added $dir to $fish_cfg"
  fi
}

add_bun_to_path() {
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
}

# ─── Node.js ─────────────────────────────────────────────────────────────────

install_node() {
  info "Installing Node.js 22..."
  case "$PKG" in
    apt)
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
      sudo apt-get install -y nodejs >/dev/null 2>&1
      ;;
    dnf)
      curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
      sudo dnf install -y nodejs >/dev/null 2>&1
      ;;
    yum)
      curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash - >/dev/null 2>&1
      sudo yum install -y nodejs >/dev/null 2>&1
      ;;
    pacman)
      sudo pacman -S --noconfirm nodejs npm >/dev/null 2>&1
      ;;
    zypper)
      sudo zypper install -y nodejs22 >/dev/null 2>&1
      ;;
    brew)
      brew install node >/dev/null 2>&1
      ;;
    *)
      error "Cannot auto-install Node.js on this system. Install manually: https://nodejs.org"
      ;;
  esac
}

ensure_node() {
  if ! check_command node; then
    warn "Node.js not found — installing..."
    install_node
  else
    local major
    major=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
    if [ "${major:-0}" -lt 18 ]; then
      warn "Node.js $(node --version) is too old — upgrading..."
      install_node
    fi
  fi
  success "Node.js $(node --version)"
}

# ─── Bun ─────────────────────────────────────────────────────────────────────

install_bun() {
  info "Installing Bun..."
  if [ "$PKG" = "brew" ]; then
    brew install bun >/dev/null 2>&1
  else
    curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1 \
      || error "Failed to install Bun. Visit https://bun.sh"
  fi
  add_bun_to_path
}

ensure_bun() {
  if ! check_command bun; then
    warn "Bun not found — installing..."
    install_bun
  else
    add_bun_to_path
  fi
  success "Bun $(bun --version)"
}

# ─── Git ─────────────────────────────────────────────────────────────────────

ensure_git() {
  if check_command git; then
    success "Git $(git --version | awk '{print $3}')"
    return
  fi
  info "Installing Git..."
  case "$PKG" in
    apt)    sudo apt-get install -y git >/dev/null 2>&1 ;;
    dnf)    sudo dnf install -y git >/dev/null 2>&1 ;;
    yum)    sudo yum install -y git >/dev/null 2>&1 ;;
    pacman) sudo pacman -S --noconfirm git >/dev/null 2>&1 ;;
    zypper) sudo zypper install -y git >/dev/null 2>&1 ;;
    brew)   brew install git >/dev/null 2>&1 ;;
    *)      error "Git not found. Install manually: https://git-scm.com" ;;
  esac
  success "Git $(git --version | awk '{print $3}')"
}

# ─── OpenCode ─────────────────────────────────────────────────────────────────

ensure_opencode() {
  if check_command opencode; then
    success "OpenCode $(opencode --version 2>/dev/null || echo 'installed')"
    return
  fi
  info "Installing OpenCode..."
  npm install -g opencode-ai --allow-scripts 2>/dev/null \
    || npm install -g opencode-ai --allow-scripts \
    || error "Failed to install OpenCode. Try manually: npm install -g opencode-ai --allow-scripts"
  success "OpenCode installed"
}

# ─── check requirements ───────────────────────────────────────────────────────

info "Checking requirements..."
ensure_node
ensure_bun
ensure_git
ensure_opencode

# ─── clone / update ───────────────────────────────────────────────────────────

info "Installing CryptHunter..."

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Updating existing installation at $INSTALL_DIR..."
  git -C "$INSTALL_DIR" fetch --quiet origin main 2>/dev/null \
    && git -C "$INSTALL_DIR" reset --quiet --hard origin/main 2>/dev/null \
    || warn "Could not update — using existing version"
else
  [ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
  info "Cloning CryptHunter to $INSTALL_DIR..."
  git clone --quiet --depth=1 "$REPO" "$INSTALL_DIR" \
    || error "Clone failed. Check internet connection and try again."
fi

# ─── launcher ─────────────────────────────────────────────────────────────────

create_launcher_unix() {
  mkdir -p "$BIN_DIR"
  ln -sf "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/crypthunter"
  ln -sf "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/ch"
  chmod +x "$INSTALL_DIR/bin/crypthunter.js"
  add_to_path_in_rc "$BIN_DIR"
  export PATH="$BIN_DIR:$PATH"
  success "Launcher: $BIN_DIR/crypthunter"
}

create_launcher_windows() {
  local win_bin="$INSTALL_DIR/bin"
  # Create .cmd wrapper for Windows CMD
  cat > "$win_bin/crypthunter.cmd" << 'CMD'
@echo off
node "%~dp0crypthunter.js" %*
CMD
  # Git Bash / WSL path
  mkdir -p "$BIN_DIR"
  ln -sf "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/crypthunter" 2>/dev/null \
    || cp "$INSTALL_DIR/bin/crypthunter.js" "$BIN_DIR/crypthunter"
  chmod +x "$INSTALL_DIR/bin/crypthunter.js"
  add_to_path_in_rc "$BIN_DIR"
  export PATH="$BIN_DIR:$PATH"
  success "Launcher: $BIN_DIR/crypthunter (+ $win_bin/crypthunter.cmd for CMD)"
}

case "$OS" in
  windows) create_launcher_windows ;;
  *)       create_launcher_unix ;;
esac

# ─── register plugin with OpenCode ────────────────────────────────────────────

register_plugin() {
  local plugin_entry="file://$INSTALL_DIR/dist/index.js"
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

  # Update existing config via node
  node - "$config_file" "$plugin_entry" << 'JS'
const fs = require("fs");
const path = process.argv[2];
const entry = process.argv[3];
let content = fs.readFileSync(path, "utf8");
const pluginRe = /"plugin"\s*:\s*\[([^\]]*)\]/s;
const match = content.match(pluginRe);
if (match) {
  const items = match[1]
    .split(",")
    .map(s => s.trim().replace(/^"|"$/g, ""))
    .filter(s => s && !s.includes("crypthunter") && !s.includes("oh-my-open-pentest") && !s.includes(".crypthunter"));
  items.push(entry);
  content = content.replace(pluginRe, `"plugin": [${items.map(s => `"${s}"`).join(", ")}]`);
} else {
  content = content.replace(/(\{)/, `$1\n  "plugin": ["${entry}"],`);
}
fs.writeFileSync(path, content);
JS
}

info "Registering CryptHunter plugin with OpenCode..."
register_plugin \
  && success "Plugin registered in ~/.config/opencode/opencode.jsonc" \
  || warn "Auto-registration failed — run: crypthunter install"

BUILD_STATE_DIR="$INSTALL_DIR/tools"
BUILD_REVISION_FILE="$BUILD_STATE_DIR/.build-revision"
BUILD_LOG="$BUILD_STATE_DIR/.build.log"
mkdir -p "$BUILD_STATE_DIR"
CURRENT_REVISION=$(git -C "$INSTALL_DIR" rev-parse HEAD 2>/dev/null || true)
BUILT_REVISION=$(cat "$BUILD_REVISION_FILE" 2>/dev/null || true)
if [ ! -f "$INSTALL_DIR/dist/index.js" ] \
  || [ ! -f "$INSTALL_DIR/dist/tui.js" ] \
  || [ ! -f "$INSTALL_DIR/dist/cli/index.js" ] \
  || [ -z "$CURRENT_REVISION" ] \
  || [ "$BUILT_REVISION" != "$CURRENT_REVISION" ]; then
  info "Building CryptHunter for the installed revision..."
  [ -f "$INSTALL_DIR/package.json" ] || error "Installation is incomplete: $INSTALL_DIR/package.json is missing"
  [ -n "$CURRENT_REVISION" ] || error "Could not identify the installed CryptHunter revision"
  cd "$INSTALL_DIR" || error "Cannot enter installation directory: $INSTALL_DIR"
  if ! bun install --silent --frozen-lockfile > "$BUILD_LOG" 2>&1; then
    error "Dependency installation failed. Details: $BUILD_LOG"
  fi
  if ! bun run build:install >> "$BUILD_LOG" 2>&1; then
    error "CryptHunter build failed. Details: $BUILD_LOG"
  fi
  [ -f "$INSTALL_DIR/dist/index.js" ] || error "Build completed without dist/index.js"
  [ -f "$INSTALL_DIR/dist/tui.js" ] || error "Build completed without dist/tui.js"
  [ -f "$INSTALL_DIR/dist/cli/index.js" ] || error "Build completed without dist/cli/index.js"
  printf '%s\n' "$CURRENT_REVISION" > "$BUILD_REVISION_FILE"
  success "CryptHunter build ready"
fi

BOOTSTRAP_INSTALL_DIR="$INSTALL_DIR"
if [ "$OS" = "windows" ]; then
  check_command cygpath || error "Git Bash path conversion is required for Windows tool installation"
  BOOTSTRAP_INSTALL_DIR=$(cygpath -m "$INSTALL_DIR")
fi

if CRYPTHUNTER_INSTALL_DIR="$BOOTSTRAP_INSTALL_DIR" "$INSTALL_DIR/bin/crypthunter.js" tools bootstrap --quiet; then
  success "Recommended tools and Nuclei templates checked quietly"
else
  warn "Some recommended tools were deferred. Retry with: crypthunter tools bootstrap"
fi

# ─── done ─────────────────────────────────────────────────────────────────────

printf "\n"
success "CryptHunter installed!"
printf "\n"

case "$OS" in
  windows)
    printf "  ${BOLD}Windows — next steps:${NC}\n\n"
    printf "  1. Restart terminal (or open new Git Bash window)\n\n"
    printf "  2. Setup AI provider:\n"
    printf "       ${CYAN}crypthunter install${NC}\n\n"
    printf "  3. Launch:\n"
    printf "       ${CYAN}opencode${NC}\n\n"
    ;;
  *)
    printf "  ${BOLD}Next steps:${NC}\n\n"
    printf "  1. Reload your shell:\n"
    printf "       ${CYAN}exec \$SHELL${NC}\n\n"
    printf "  2. Setup AI provider (Claude / OpenAI / Gemini / Copilot):\n"
    printf "       ${CYAN}crypthunter install${NC}\n\n"
    printf "  3. Launch:\n"
    printf "       ${CYAN}opencode${NC}\n\n"
    ;;
esac

printf "  ${BOLD}Agents:${NC}\n"
printf "     Cerberus  main orchestrator + security intelligence\n"
printf "     Scylla    deep autonomous worker\n"
printf "     Talos     strategic planner\n"
printf "     Argus     todo executor\n\n"
printf "  ${BOLD}Quick start:${NC}\n"
printf "     ${CYAN}fullscan https://target.example.com${NC}\n"
printf "     ${CYAN}/mode ctf${NC}\n"
printf "     ${CYAN}/mode red-team${NC}\n\n"
