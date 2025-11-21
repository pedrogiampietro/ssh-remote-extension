# VS Code SSH File Manager Extension - Exemplo

Esta é uma extensão de exemplo para VS Code que demonstra como criar um gerenciador de arquivos SSH/SFTP similar ao BitVise ou FileZilla, integrado diretamente no editor.

## Funcionalidades

- 🔌 **Gerenciamento de Conexões SSH**: Adicione e gerencie múltiplas conexões SSH
- 📁 **Explorador de Arquivos Remoto**: Navegue pelos arquivos no servidor remoto através de uma TreeView
- 💻 **Terminal SSH Integrado**: Abra terminais SSH diretamente no VS Code
- 🔐 **Autenticação**: Suporte para senha ou chave privada
- ⬆️⬇️ **Transferência de Arquivos**: Upload e download de arquivos (em desenvolvimento)

## Como Usar

### 1. Instalação das Dependências

```bash
cd vscode-ssh-extension-example
npm install
```

### 2. Compilar a Extensão

```bash
npm run compile
```

### 3. Testar a Extensão

1. Abra a pasta `vscode-ssh-extension-example` no VS Code
2. Pressione `F5` para abrir uma nova janela do VS Code com a extensão carregada
3. Na barra lateral, você verá uma nova view chamada "SSH Connections"

### 4. Adicionar uma Conexão SSH

1. Clique no ícone `+` na view "SSH Connections"
2. Preencha os dados:
   - Nome da conexão
   - Host (endereço do servidor)
   - Porta (padrão: 22)
   - Username
   - Método de autenticação (Senha ou Chave Privada)

### 5. Conectar e Usar

- Clique no ícone de conexão para conectar ao servidor
- Navegue pelos arquivos remotos
- Clique no ícone de terminal para abrir um terminal SSH

## Estrutura do Projeto

```
vscode-ssh-extension-example/
├── package.json          # Manifesto da extensão
├── tsconfig.json         # Configuração TypeScript
├── src/
│   └── extension.ts      # Código principal da extensão
└── README.md            # Este arquivo
```

## Principais Componentes

### 1. TreeDataProvider (`SSHExplorerProvider`)
Gerencia a visualização em árvore das conexões e arquivos remotos.

### 2. Comandos Registrados
- `sshFileManager.addConnection` - Adicionar nova conexão
- `sshFileManager.connect` - Conectar ao servidor
- `sshFileManager.disconnect` - Desconectar
- `sshFileManager.openTerminal` - Abrir terminal SSH
- `sshFileManager.uploadFile` - Upload de arquivo
- `sshFileManager.downloadFile` - Download de arquivo

### 3. Bibliotecas Utilizadas
- **ssh2**: Cliente SSH para Node.js
- **ssh2-sftp-client**: Cliente SFTP construído sobre ssh2

## Próximos Passos para Melhorar

1. **Implementar Upload/Download**: Completar as funções de transferência de arquivos
2. **Edição Remota**: Permitir editar arquivos remotos diretamente
3. **Sincronização**: Sincronizar pastas locais com remotas
4. **Gerenciamento de Chaves**: Interface melhor para gerenciar chaves SSH
5. **Histórico de Comandos**: Salvar histórico de comandos do terminal
6. **Favoritos**: Marcar diretórios remotos como favoritos

## Publicar a Extensão

Para publicar no VS Code Marketplace:

```bash
# Instalar vsce
npm install -g @vscode/vsce

# Criar pacote
vsce package

# Publicar (requer conta no marketplace)
vsce publish
```

## Recursos Adicionais

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TreeView Guide](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Terminal API](https://code.visualstudio.com/api/references/vscode-api#Terminal)
- [ssh2 Documentation](https://github.com/mscdex/ssh2)

## Licença

MIT
