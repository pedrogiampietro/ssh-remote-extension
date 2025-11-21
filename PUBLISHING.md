# 📦 Publishing SSH File Manager to VS Code Marketplace

## Prerequisites

1. **Microsoft Account**: You need a Microsoft account
2. **Azure DevOps Organization**: Create one at https://dev.azure.com
3. **Personal Access Token (PAT)**: Create a token with Marketplace publishing permissions

## Step-by-Step Publishing Guide

### 1. Create Azure DevOps Organization

1. Go to https://dev.azure.com
2. Sign in with your Microsoft account
3. Click "Create new organization"
4. Choose a name (e.g., "pedrogiampietro")

### 2. Create Personal Access Token (PAT)

1. In Azure DevOps, click your profile icon (top right)
2. Select "Personal access tokens"
3. Click "+ New Token"
4. Configure:
   - **Name**: `vsce-publishing`
   - **Organization**: Select "All accessible organizations"
   - **Expiration**: Choose duration (e.g., 90 days)
   - **Scopes**: Select "Custom defined"
   - Check **Marketplace** → **Manage** (this gives publish permissions)
5. Click "Create"
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### 3. Create Publisher

```bash
# Login with your PAT
npx vsce login <publisher-name>
# Example: npx vsce login pedrogiampietro
# When prompted, paste your PAT
```

Or create publisher via web:
1. Go to https://marketplace.visualstudio.com/manage
2. Click "Create publisher"
3. Fill in:
   - **ID**: `pedrogiampietro` (must match package.json)
   - **Name**: Your display name
   - **Email**: Your email

### 4. Update package.json

Make sure these fields are correct:

```json
{
  "publisher": "pedrogiampietro",
  "version": "0.0.1",
  "repository": {
    "type": "git",
    "url": "https://github.com/pedrogiampietro/vscode-ssh-extension"
  }
}
```

### 5. Publish Extension

```bash
# First time publishing
npx vsce publish

# Or specify version bump
npx vsce publish patch  # 0.0.1 -> 0.0.2
npx vsce publish minor  # 0.0.1 -> 0.1.0
npx vsce publish major  # 0.0.1 -> 1.0.0
```

### 6. Verify Publication

1. Go to https://marketplace.visualstudio.com/manage/publishers/pedrogiampietro
2. You should see your extension listed
3. It may take a few minutes to appear in search

## Publishing Checklist

- [x] LICENSE file created
- [x] .vscodeignore file created
- [x] README.md is complete and informative
- [x] package.json has all required fields
- [ ] Azure DevOps organization created
- [ ] Personal Access Token generated
- [ ] Publisher created/verified
- [ ] Extension published

## Updating Your Extension

When you make changes:

```bash
# 1. Make your changes
# 2. Update version in package.json
# 3. Compile
npm run compile

# 4. Package to test locally
npx vsce package

# 5. Test the .vsix file
code --install-extension ssh-file-manager-X.X.X.vsix

# 6. Publish update
npx vsce publish
```

## Common Issues

### "Publisher not found"
- Make sure publisher ID in package.json matches your publisher ID
- Login again: `npx vsce login <publisher-name>`

### "Missing repository field"
- Add repository URL to package.json

### "Missing LICENSE"
- Ensure LICENSE file exists in root directory

### "Package too large"
- Check .vscodeignore is working
- Run `npx vsce ls` to see included files

## Marketplace Best Practices

1. **Good README**: Clear description, screenshots, features
2. **Icon**: Add a 128x128 icon (package.json: `"icon": "icon.png"`)
3. **Categories**: Set appropriate categories
4. **Keywords**: Add searchable keywords
5. **Changelog**: Maintain CHANGELOG.md
6. **Versioning**: Follow semantic versioning

## Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace](https://marketplace.visualstudio.com/)
- [Azure DevOps](https://dev.azure.com/)
