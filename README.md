# SSH File Manager

A powerful SSH/SFTP file manager extension for VS Code and Antigravity. Manage remote servers, browse files, edit remotely, and open integrated terminals - all without leaving your editor.

## ✨ Features

### 🔌 Connection Management
- **Visual Connection Manager**: Modern WebView UI for adding and managing SSH connections
- **Multiple Connections**: Save and manage unlimited SSH connections
- **Flexible Authentication**: Support for password and private key authentication
- **Quick Connect**: One-click connection to your servers

### 📁 Remote File Browser
- **Tree View Explorer**: Browse remote files and folders in a familiar tree structure
- **Colored File Icons**: 40+ file types with color-coded icons (JS, Python, C++, Lua, etc.)
- **Smart Sorting**: Folders first, then files - all alphabetically organized
- **Double-Click to Open**: Instantly open remote files for editing

### ✏️ Remote File Editing
- **Auto-Sync**: Automatic synchronization when you save files (Cmd+S / Ctrl+S)
- **Live Editing**: Edit remote files as if they were local
- **Real-time Feedback**: Visual notifications for sync status

### 💻 Integrated Terminal
- **SSH Terminal**: Open SSH terminals directly in VS Code
- **Multiple Sessions**: Run multiple terminal sessions simultaneously
- **Full Terminal Support**: Complete SSH terminal functionality

### 🎨 Beautiful UI
- **Modern Design**: Clean, professional interface
- **Theme Integration**: Automatically adapts to VS Code light/dark themes
- **Intuitive Icons**: Clear visual indicators for all file types and actions
- **Collapse All**: Quickly collapse all expanded folders

## 🚀 Quick Start

1. **Install the extension**
2. **Open SSH Manager**: Click the SSH icon in the Activity Bar
3. **Add Connection**: Click the "+" button or use "SSH: Add Connection" command
4. **Connect**: Click the connect button on your saved connection
5. **Browse & Edit**: Navigate files and double-click to edit

## 📋 Requirements

- VS Code 1.85.0 or higher (or Antigravity)
- SSH access to remote servers
- Node.js (for extension development)

## 🎯 Usage

### Adding a Connection

1. Click the **+** button in the SSH Manager sidebar
2. Fill in connection details:
   - **Name**: A friendly name for this connection
   - **Host**: Server address (IP or domain)
   - **Port**: SSH port (default: 22)
   - **Username**: Your SSH username
   - **Authentication**: Choose password or private key

### Editing Remote Files

1. Connect to a server
2. Browse to your file
3. **Double-click** to open
4. Edit the file
5. **Save** (Cmd+S / Ctrl+S) - changes sync automatically!
6. See "✅ Synced to remote" confirmation

### Opening Terminal

- Click the terminal icon on any connection
- Or right-click connection → "Open Terminal"

## ⌨️ Commands

- `SSH: Add Connection` - Add new SSH connection
- `SSH: Open UI` - Open connection manager UI
- `SSH: Refresh` - Refresh file tree
- `SSH: Collapse All` - Collapse all folders
- `SSH: Open Terminal` - Open SSH terminal
- `SSH: Disconnect` - Disconnect from server

## 🎨 File Type Icons

Supports colored icons for:
- **Languages**: JavaScript, TypeScript, Python, C/C++, Lua, Java, Go, Rust, PHP, Ruby
- **Web**: HTML, CSS, SCSS, SASS
- **Config**: JSON, YAML, XML, TOML, ENV
- **Documents**: Markdown, TXT, PDF
- **Images**: PNG, JPG, SVG, GIF
- **Archives**: ZIP, TAR, GZ, RAR
- **Shell**: SH, BASH, ZSH
- **Database**: SQL, SQLite
- And many more!

## 🔧 Extension Settings

This extension stores connection data in VS Code's global state. No additional configuration required!

## 🐛 Known Issues

- Large file transfers may take time (working on progress indicators)
- Some SFTP servers may have compatibility issues

## 📝 Release Notes

### 0.0.1 (Initial Release)

- ✅ SSH/SFTP connection management
- ✅ Remote file browser with colored icons
- ✅ Auto-sync remote file editing
- ✅ Integrated SSH terminal
- ✅ Modern WebView UI
- ✅ Alphabetical file sorting
- ✅ Collapse all functionality

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/pedrogiampietro/vscode-ssh-extension).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Built with:
- [ssh2](https://github.com/mscdex/ssh2) - SSH2 client for Node.js
- [ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client) - SFTP client

---

**Enjoy managing your remote servers!** 🚀
