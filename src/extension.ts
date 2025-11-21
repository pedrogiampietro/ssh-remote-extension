import * as vscode from 'vscode';
import { Client as SSHClient } from 'ssh2';
import SFTPClient, { FileInfo } from 'ssh2-sftp-client';
import { SSHWebViewProvider, SSHWebViewPanel } from './webview';

interface SSHConnection {
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}


class SSHTreeItem extends vscode.TreeItem {
    public isDirectory: boolean = false;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly connection?: SSHConnection,
        public readonly remotePath?: string,
        isDirectory?: boolean
    ) {
        super(label, collapsibleState);

        this.isDirectory = isDirectory || false;

        if (connection && !remotePath) {
            // Connection item
            this.contextValue = 'connection';
            this.iconPath = new vscode.ThemeIcon('server', new vscode.ThemeColor('terminal.ansiCyan'));
            this.tooltip = `${connection.username}@${connection.host}:${connection.port}`;
        } else if (remotePath) {
            if (this.isDirectory) {
                // Directory item
                this.contextValue = 'directory';
                this.iconPath = this.collapsibleState === vscode.TreeItemCollapsibleState.Expanded
                    ? new vscode.ThemeIcon('folder-opened', new vscode.ThemeColor('terminal.ansiYellow'))
                    : new vscode.ThemeIcon('folder', new vscode.ThemeColor('terminal.ansiYellow'));
                this.tooltip = remotePath;
            } else {
                // File item
                this.contextValue = 'file';
                this.iconPath = this.getFileIcon(label);
                this.tooltip = remotePath;
                // Make file clickable
                this.command = {
                    command: 'sshFileManager.openFile',
                    title: 'Open File',
                    arguments: [this]
                };
            }
        }
    }

    private getFileIcon(filename: string): vscode.ThemeIcon {
        const ext = filename.split('.').pop()?.toLowerCase() || '';

        // Map file extensions to VS Code icons with colors
        const iconConfig: { [key: string]: { icon: string, color?: string } } = {
            // JavaScript/TypeScript - Yellow
            'js': { icon: 'symbol-method', color: 'charts.yellow' },
            'jsx': { icon: 'symbol-method', color: 'charts.yellow' },
            'mjs': { icon: 'symbol-method', color: 'charts.yellow' },
            'cjs': { icon: 'symbol-method', color: 'charts.yellow' },
            'ts': { icon: 'symbol-method', color: 'charts.blue' },
            'tsx': { icon: 'symbol-method', color: 'charts.blue' },

            // Python - Blue
            'py': { icon: 'symbol-method', color: 'charts.blue' },
            'pyc': { icon: 'symbol-method', color: 'charts.blue' },
            'pyw': { icon: 'symbol-method', color: 'charts.blue' },

            // C/C++ - Purple
            'c': { icon: 'symbol-class', color: 'charts.purple' },
            'cpp': { icon: 'symbol-class', color: 'charts.purple' },
            'cc': { icon: 'symbol-class', color: 'charts.purple' },
            'cxx': { icon: 'symbol-class', color: 'charts.purple' },
            'h': { icon: 'symbol-class', color: 'charts.purple' },
            'hpp': { icon: 'symbol-class', color: 'charts.purple' },

            // Lua - Cyan
            'lua': { icon: 'symbol-method', color: 'terminal.ansiCyan' },

            // Java - Red
            'java': { icon: 'symbol-class', color: 'charts.red' },
            'class': { icon: 'symbol-class', color: 'charts.red' },
            'jar': { icon: 'file-zip', color: 'charts.red' },

            // Go - Cyan
            'go': { icon: 'symbol-method', color: 'terminal.ansiCyan' },

            // Rust - Orange
            'rs': { icon: 'symbol-method', color: 'charts.orange' },

            // PHP - Purple
            'php': { icon: 'symbol-method', color: 'charts.purple' },

            // Ruby - Red
            'rb': { icon: 'symbol-method', color: 'charts.red' },
            'erb': { icon: 'symbol-method', color: 'charts.red' },

            // Web - Various colors
            'html': { icon: 'symbol-property', color: 'charts.orange' },
            'htm': { icon: 'symbol-property', color: 'charts.orange' },
            'css': { icon: 'symbol-color', color: 'charts.blue' },
            'scss': { icon: 'symbol-color', color: 'charts.purple' },
            'sass': { icon: 'symbol-color', color: 'charts.purple' },
            'less': { icon: 'symbol-color', color: 'charts.blue' },

            // Config - Gray/White
            'json': { icon: 'symbol-object', color: 'charts.yellow' },
            'yaml': { icon: 'symbol-object', color: 'charts.purple' },
            'yml': { icon: 'symbol-object', color: 'charts.purple' },
            'xml': { icon: 'symbol-object', color: 'charts.orange' },
            'toml': { icon: 'symbol-object', color: 'charts.orange' },
            'ini': { icon: 'symbol-object', color: 'terminal.ansiWhite' },
            'conf': { icon: 'symbol-object', color: 'terminal.ansiWhite' },
            'config': { icon: 'symbol-object', color: 'terminal.ansiWhite' },
            'env': { icon: 'symbol-object', color: 'charts.green' },

            // Documents - Blue
            'md': { icon: 'markdown', color: 'charts.blue' },
            'txt': { icon: 'file-text', color: 'terminal.ansiWhite' },
            'pdf': { icon: 'file-pdf', color: 'charts.red' },
            'doc': { icon: 'file-text', color: 'charts.blue' },
            'docx': { icon: 'file-text', color: 'charts.blue' },

            // Images - Green
            'png': { icon: 'file-media', color: 'charts.green' },
            'jpg': { icon: 'file-media', color: 'charts.green' },
            'jpeg': { icon: 'file-media', color: 'charts.green' },
            'gif': { icon: 'file-media', color: 'charts.green' },
            'svg': { icon: 'file-media', color: 'charts.orange' },
            'ico': { icon: 'file-media', color: 'charts.blue' },
            'webp': { icon: 'file-media', color: 'charts.green' },

            // Archives - Orange
            'zip': { icon: 'file-zip', color: 'charts.orange' },
            'tar': { icon: 'file-zip', color: 'charts.orange' },
            'gz': { icon: 'file-zip', color: 'charts.orange' },
            'rar': { icon: 'file-zip', color: 'charts.orange' },
            '7z': { icon: 'file-zip', color: 'charts.orange' },
            'bz2': { icon: 'file-zip', color: 'charts.orange' },

            // Shell - Green
            'sh': { icon: 'terminal', color: 'charts.green' },
            'bash': { icon: 'terminal', color: 'charts.green' },
            'zsh': { icon: 'terminal', color: 'charts.green' },
            'fish': { icon: 'terminal', color: 'charts.green' },
            'bat': { icon: 'terminal', color: 'charts.green' },
            'cmd': { icon: 'terminal', color: 'charts.green' },

            // Database - Purple
            'sql': { icon: 'database', color: 'charts.purple' },
            'db': { icon: 'database', color: 'charts.purple' },
            'sqlite': { icon: 'database', color: 'charts.purple' },
            'sqlite3': { icon: 'database', color: 'charts.purple' },

            // Logs - Gray
            'log': { icon: 'output', color: 'terminal.ansiWhite' },
        };

        const config = iconConfig[ext] || { icon: 'file', color: undefined };

        if (config.color) {
            return new vscode.ThemeIcon(config.icon, new vscode.ThemeColor(config.color));
        }
        return new vscode.ThemeIcon(config.icon);
    }
}


class SSHExplorerProvider implements vscode.TreeDataProvider<SSHTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SSHTreeItem | undefined | null | void> = new vscode.EventEmitter<SSHTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SSHTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private connections: SSHConnection[] = [];
    private sftpClients: Map<string, SFTPClient> = new Map();

    constructor(private context: vscode.ExtensionContext) {
        this.loadConnections();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SSHTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: SSHTreeItem): Promise<SSHTreeItem[]> {
        if (!element) {
            // Root level - show connections
            return this.connections.map(conn =>
                new SSHTreeItem(conn.name, vscode.TreeItemCollapsibleState.Collapsed, conn)
            );
        } else if (element.connection && !element.remotePath) {
            // Show root directory of connection
            return this.listRemoteFiles(element.connection, '/');
        } else if (element.connection && element.remotePath) {
            // Show files in directory
            return this.listRemoteFiles(element.connection, element.remotePath);
        }
        return [];
    }

    private async listRemoteFiles(connection: SSHConnection, path: string): Promise<SSHTreeItem[]> {
        const sftp = await this.getSFTPClient(connection);
        try {
            const files = await sftp.list(path);

            // Map files to tree items
            const items = files.map((file: FileInfo) => {
                const fullPath = `${path}/${file.name}`;
                const isDir = file.type === 'd';
                return new SSHTreeItem(
                    file.name,
                    isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    connection,
                    fullPath,
                    isDir
                );
            });

            // Sort: folders first (alphabetically), then files (alphabetically)
            return items.sort((a, b) => {
                // Folders come before files
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;

                // Within same type, sort alphabetically (case-insensitive)
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error listing files: ${error}`);
            return [];
        }
    }

    private async getSFTPClient(connection: SSHConnection): Promise<SFTPClient> {
        const key = `${connection.host}:${connection.port}`;

        if (!this.sftpClients.has(key)) {
            const sftp = new SFTPClient();
            await sftp.connect({
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password,
                privateKey: connection.privateKey
            });
            this.sftpClients.set(key, sftp);
        }

        return this.sftpClients.get(key)!;
    }

    async addConnection(): Promise<void> {
        const name = await vscode.window.showInputBox({ prompt: 'Connection name' });
        if (!name) return;

        const host = await vscode.window.showInputBox({ prompt: 'Host' });
        if (!host) return;

        const port = await vscode.window.showInputBox({ prompt: 'Port', value: '22' });
        if (!port) return;

        const username = await vscode.window.showInputBox({ prompt: 'Username' });
        if (!username) return;

        const authMethod = await vscode.window.showQuickPick(['Password', 'Private Key'], {
            placeHolder: 'Select authentication method'
        });
        if (!authMethod) return;

        let password: string | undefined;
        let privateKey: string | undefined;

        if (authMethod === 'Password') {
            password = await vscode.window.showInputBox({
                prompt: 'Password',
                password: true
            });
        } else {
            const keyUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: { 'Private Keys': ['pem', 'key', 'ppk'] }
            });
            if (keyUri && keyUri[0]) {
                const keyContent = await vscode.workspace.fs.readFile(keyUri[0]);
                privateKey = Buffer.from(keyContent).toString('utf-8');
            }
        }

        const connection: SSHConnection = {
            name,
            host,
            port: parseInt(port),
            username,
            password,
            privateKey
        };

        this.connections.push(connection);
        this.saveConnections();
        this.refresh();
    }

    async editConnection(connection: SSHConnection): Promise<void> {
        const index = this.connections.findIndex(c => c.name === connection.name);
        if (index === -1) return;

        const name = await vscode.window.showInputBox({
            prompt: 'Connection name',
            value: connection.name
        });
        if (!name) return;

        const host = await vscode.window.showInputBox({
            prompt: 'Host',
            value: connection.host
        });
        if (!host) return;

        const port = await vscode.window.showInputBox({
            prompt: 'Port',
            value: connection.port.toString()
        });
        if (!port) return;

        const username = await vscode.window.showInputBox({
            prompt: 'Username',
            value: connection.username
        });
        if (!username) return;

        this.connections[index] = {
            ...connection,
            name,
            host,
            port: parseInt(port),
            username
        };

        this.saveConnections();
        this.refresh();
        vscode.window.showInformationMessage(`Connection "${name}" updated!`);
    }

    async deleteConnection(connection: SSHConnection): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            `Delete connection "${connection.name}"?`,
            { modal: true },
            'Delete'
        );

        if (confirm === 'Delete') {
            // Disconnect first if connected
            await this.disconnect(connection);

            // Remove from list
            this.connections = this.connections.filter(c => c.name !== connection.name);
            this.saveConnections();
            this.refresh();
            vscode.window.showInformationMessage(`Connection "${connection.name}" deleted!`);
        }
    }

    async disconnect(connection: SSHConnection): Promise<void> {
        const key = `${connection.host}:${connection.port}`;
        const client = this.sftpClients.get(key);
        if (client) {
            await client.end();
            this.sftpClients.delete(key);
        }
        vscode.window.showInformationMessage(`Disconnected from ${connection.name}`);
    }

    // Track remote files for auto-sync
    private remoteFileMap: Map<string, { connection: SSHConnection, remotePath: string }> = new Map();

    async openRemoteFile(item: SSHTreeItem): Promise<void> {
        if (!item.connection || !item.remotePath) return;

        try {
            const sftp = await this.getSFTPClient(item.connection);

            // Create unique temp path
            const tempPath = `/tmp/ssh-${item.connection.host}-${item.remotePath.replace(/\//g, '-')}`;
            await sftp.get(item.remotePath, tempPath);

            // Track this file for auto-sync
            this.remoteFileMap.set(tempPath, {
                connection: item.connection,
                remotePath: item.remotePath
            });

            // Open the file
            const fileUri = vscode.Uri.file(tempPath);
            const doc = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(doc);

            vscode.window.showInformationMessage(`📂 Opened remote file: ${item.label} (auto-sync enabled)`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening file: ${error}`);
        }
    }

    async syncRemoteFile(document: vscode.TextDocument): Promise<void> {
        const localPath = document.uri.fsPath;
        const remoteInfo = this.remoteFileMap.get(localPath);

        if (!remoteInfo) return;

        try {
            const sftp = await this.getSFTPClient(remoteInfo.connection);
            await sftp.put(localPath, remoteInfo.remotePath);
            vscode.window.showInformationMessage(`✅ Synced to remote: ${remoteInfo.remotePath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Failed to sync file: ${error}`);
        }
    }

    cleanupRemoteFile(document: vscode.TextDocument): void {
        const localPath = document.uri.fsPath;
        if (this.remoteFileMap.has(localPath)) {
            this.remoteFileMap.delete(localPath);
        }
    }

    private loadConnections(): void {
        const saved = this.context.globalState.get<SSHConnection[]>('sshConnections', []);
        this.connections = saved;
    }

    private saveConnections(): void {
        this.context.globalState.update('sshConnections', this.connections);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('SSH File Manager extension is now active');

    const sshExplorerProvider = new SSHExplorerProvider(context);

    // Create TreeView to enable collapse functionality
    const treeView = vscode.window.createTreeView('sshExplorer', {
        treeDataProvider: sshExplorerProvider,
        showCollapseAll: true
    });

    // Register WebView provider
    const webviewProvider = new SSHWebViewProvider(context.extensionUri, context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SSHWebViewProvider.viewType, webviewProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.openUI', () => {
            SSHWebViewPanel.createOrShow(context.extensionUri, context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.connectFromWebview', async (connection: SSHConnection) => {
            try {
                vscode.window.showInformationMessage(`Connecting to ${connection.name}...`);

                // Try to establish SFTP connection
                const sftp = new SFTPClient();
                await sftp.connect({
                    host: connection.host,
                    port: connection.port,
                    username: connection.username,
                    password: connection.password,
                    privateKey: connection.privateKey
                });

                await sftp.end();
                vscode.window.showInformationMessage(`✅ Successfully connected to ${connection.name}!`);

                // Refresh the tree view to show the connection
                vscode.commands.executeCommand('sshFileManager.refresh');
            } catch (error) {
                vscode.window.showErrorMessage(`❌ Failed to connect to ${connection.name}: ${error}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.addConnection', () => {
            // Open WebView panel instead of input boxes
            SSHWebViewPanel.createOrShow(context.extensionUri, context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.connect', (item: SSHTreeItem) => {
            vscode.window.showInformationMessage(`Connecting to ${item.label}...`);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.disconnect', (item: SSHTreeItem) => {
            if (item.connection) {
                sshExplorerProvider.disconnect(item.connection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.openTerminal', (item: SSHTreeItem) => {
            if (item.connection) {
                openSSHTerminal(item.connection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.uploadFile', async () => {
            vscode.window.showInformationMessage('Upload file feature coming soon!');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.downloadFile', async () => {
            vscode.window.showInformationMessage('Download file feature coming soon!');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.refresh', () => {
            sshExplorerProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.collapseAll', () => {
            // Refresh the tree to collapse all items
            sshExplorerProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.editConnection', (item: SSHTreeItem) => {
            if (item.connection) {
                sshExplorerProvider.editConnection(item.connection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.deleteConnection', (item: SSHTreeItem) => {
            if (item.connection) {
                sshExplorerProvider.deleteConnection(item.connection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sshFileManager.openFile', (item: SSHTreeItem) => {
            sshExplorerProvider.openRemoteFile(item);
        })
    );

    // Listen for document saves to auto-sync remote files
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            await sshExplorerProvider.syncRemoteFile(document);
        })
    );

    // Listen for document closes to cleanup tracking
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((document) => {
            sshExplorerProvider.cleanupRemoteFile(document);
        })
    );
}

function openSSHTerminal(connection: SSHConnection): void {
    const terminal = vscode.window.createTerminal({
        name: `SSH: ${connection.name}`,
        shellPath: 'ssh',
        shellArgs: [
            `${connection.username}@${connection.host}`,
            '-p', connection.port.toString()
        ]
    });
    terminal.show();
}

export function deactivate() {
    console.log('SSH File Manager extension is now deactivated');
}
