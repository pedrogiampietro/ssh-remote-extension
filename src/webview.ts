import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface SSHConnection {
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}

export class SSHWebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'sshManager.webview';
    private _view?: vscode.WebviewView;
    private connections: SSHConnection[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        this.loadConnections();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'src', 'webview')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'ready':
                    this.sendConnections();
                    break;
                case 'addConnection':
                    this.addConnection(data.connection);
                    break;
                case 'updateConnection':
                    this.updateConnection(data.index, data.connection);
                    break;
                case 'deleteConnection':
                    this.deleteConnection(data.index);
                    break;
                case 'connect':
                    this.connect(data.index);
                    break;
                case 'openTerminal':
                    this.openTerminal(data.index);
                    break;
                case 'browseKey':
                    this.browseKeyFile();
                    break;
            }
        });
    }

    private async browseKeyFile() {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Private Keys': ['pem', 'key', 'ppk', 'pub']
            }
        });

        if (result && result[0]) {
            this._view?.webview.postMessage({
                type: 'keyPath',
                path: result[0].fsPath
            });
        }
    }

    private addConnection(connection: SSHConnection) {
        this.connections.push(connection);
        this.saveConnections();
        this.sendConnections();
        vscode.window.showInformationMessage(`Connection "${connection.name}" added!`);
    }

    private updateConnection(index: number, connection: SSHConnection) {
        if (index >= 0 && index < this.connections.length) {
            this.connections[index] = connection;
            this.saveConnections();
            this.sendConnections();
            vscode.window.showInformationMessage(`Connection "${connection.name}" updated!`);
        }
    }

    private async deleteConnection(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            const confirm = await vscode.window.showWarningMessage(
                `Delete connection "${conn.name}"?`,
                { modal: true },
                'Delete'
            );

            if (confirm === 'Delete') {
                this.connections.splice(index, 1);
                this.saveConnections();
                this.sendConnections();
                vscode.window.showInformationMessage(`Connection "${conn.name}" deleted!`);
            }
        }
    }

    private connect(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            vscode.window.showInformationMessage(`Connecting to ${conn.name}...`);
            // Trigger the tree view connect command
            vscode.commands.executeCommand('sshFileManager.connectFromWebview', conn);
        }
    }

    private openTerminal(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            const terminal = vscode.window.createTerminal({
                name: `SSH: ${conn.name}`
            });
            terminal.show();

            // Send SSH command to terminal
            const sshCommand = `ssh ${conn.username}@${conn.host} -p ${conn.port}`;
            terminal.sendText(sshCommand);
        }
    }

    private sendConnections() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'setConnections',
                connections: this.connections
            });
        }
    }

    private loadConnections() {
        const saved = this.context.globalState.get<SSHConnection[]>('sshConnections', []);
        this.connections = saved;
    }

    private saveConnections() {
        this.context.globalState.update('sshConnections', this.connections);
        // Also trigger tree view refresh
        vscode.commands.executeCommand('sshFileManager.refresh');
    }

    public getConnections(): SSHConnection[] {
        return this.connections;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'index.html');
        let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

        return html;
    }
}

// Panel version for opening in a dedicated panel
export class SSHWebViewPanel {
    public static currentPanel: SSHWebViewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private connections: SSHConnection[] = [];

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        this._panel = panel;
        this.loadConnections();

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, extensionUri);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'ready':
                        this.sendConnections();
                        break;
                    case 'addConnection':
                        this.addConnection(message.connection);
                        break;
                    case 'updateConnection':
                        this.updateConnection(message.index, message.connection);
                        break;
                    case 'deleteConnection':
                        this.deleteConnection(message.index);
                        break;
                    case 'connect':
                        this.connect(message.index);
                        break;
                    case 'openTerminal':
                        this.openTerminal(message.index);
                        break;
                    case 'browseKey':
                        this.browseKeyFile();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SSHWebViewPanel.currentPanel) {
            SSHWebViewPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'sshManager',
            'SSH Manager',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src', 'webview')]
            }
        );

        SSHWebViewPanel.currentPanel = new SSHWebViewPanel(panel, extensionUri, context);
    }

    private async browseKeyFile() {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Private Keys': ['pem', 'key', 'ppk', 'pub']
            }
        });

        if (result && result[0]) {
            this._panel.webview.postMessage({
                type: 'keyPath',
                path: result[0].fsPath
            });
        }
    }

    private addConnection(connection: SSHConnection) {
        this.connections.push(connection);
        this.saveConnections();
        this.sendConnections();
        vscode.window.showInformationMessage(`Connection "${connection.name}" added!`);
    }

    private updateConnection(index: number, connection: SSHConnection) {
        if (index >= 0 && index < this.connections.length) {
            this.connections[index] = connection;
            this.saveConnections();
            this.sendConnections();
            vscode.window.showInformationMessage(`Connection "${connection.name}" updated!`);
        }
    }

    private async deleteConnection(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            const confirm = await vscode.window.showWarningMessage(
                `Delete connection "${conn.name}"?`,
                { modal: true },
                'Delete'
            );

            if (confirm === 'Delete') {
                this.connections.splice(index, 1);
                this.saveConnections();
                this.sendConnections();
                vscode.window.showInformationMessage(`Connection "${conn.name}" deleted!`);
            }
        }
    }

    private connect(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            vscode.window.showInformationMessage(`Connecting to ${conn.name}...`);
            vscode.commands.executeCommand('sshFileManager.connectFromWebview', conn);
        }
    }

    private openTerminal(index: number) {
        if (index >= 0 && index < this.connections.length) {
            const conn = this.connections[index];
            const terminal = vscode.window.createTerminal({
                name: `SSH: ${conn.name}`
            });
            terminal.show();

            // Send SSH command to terminal
            const sshCommand = `ssh ${conn.username}@${conn.host} -p ${conn.port}`;
            terminal.sendText(sshCommand);
        }
    }

    private sendConnections() {
        this._panel.webview.postMessage({
            type: 'setConnections',
            connections: this.connections
        });
    }

    private loadConnections() {
        const saved = this.context.globalState.get<SSHConnection[]>('sshConnections', []);
        this.connections = saved;
    }

    private saveConnections() {
        this.context.globalState.update('sshConnections', this.connections);
        vscode.commands.executeCommand('sshFileManager.refresh');
    }

    private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const htmlPath = vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'index.html');
        let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
        return html;
    }

    public dispose() {
        SSHWebViewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
