# azure-resolve-gh-ref
An Azure function that resolves a reference (a branch or tag name) of a GitHub repository to the SHA-1 of the corresponding commit.

Usage:

```
curl "https://<Function App>.azurewebsites.net/api/gh-resolve-ref?owner=<gh owner/org>&repo=<gh repo>&ref=<branch/tag name>"
```
e.g.
```
curl "https://helix-stefan-functions.azurewebsites.net/api/gh-resolve-ref?owner=adobe&repo=helix-fetch&ref=main"
```