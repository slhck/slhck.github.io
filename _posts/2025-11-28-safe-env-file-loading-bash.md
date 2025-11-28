---
layout: post
title: "Safely Loading .env Files with Special Characters in Bash"
date: 2025-11-28
categories: bash
---

When working with `.env` files in shell scripts, special characters can cause unexpected behavior or security issues. The common approach of using `source .env` or `export $(cat .env)` breaks when values contain spaces, quotes, or shell metacharacters.

Let's assume you have an `.env` file like this which does not include any quotes around values:

```# .env
DATABASE_URL=postgresql://user:p@ssw0rd!#$&*()@localhost:5432/dbname
```

Then simply running `source .env` would lead to errors or incorrect variable assignments. Yes, it would be safer to quote values in the `.env` file, but often you don't have control over how that file might be generated.

Here's a robust function that handles special characters safely:

```bash
load_env_file() {
  local env_file="${1:-.env}"
  if [ -f "$env_file" ]; then
    set -a
    while IFS='=' read -r key value; do
      # Skip comments and empty lines
      [[ "$key" =~ ^#.*$ ]] && continue
      [[ -z "$key" ]] && continue
      # Trim leading/trailing whitespace
      value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      # Only remove quotes if they match at start and end
      if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
        value="${BASH_REMATCH[1]}"
      fi
      # Export the variable
      export "$key=$value"
    done < <(grep -v '^#' "$env_file" | grep -v '^$')
    set +a
  fi
}
```

How does it work?

1. `set -a`: Automatically exports all variables assigned after this point
2. `IFS='='`: Splits only on the first `=`, allowing values to contain `=` characters
3. `read -r`: Prevents backslash interpretation, preserving literal values
4. Comment/empty line filtering: Skips lines starting with `#` or containing no key
5. Matching quote removal: Only strips quotes if they match at both start and end, preserving quotes that are part of the actual value (e.g., `"password` stays as `"password`)
6. Process substitution: `< <(grep...)` ensures the loop runs in the current shell context, and it removes comments and empty lines before processing

The function safely processes:

- Passwords with special characters: `p@ssw0rd!#$&*()`
- URLs with special chars: `postgresql://user:pass@localhost:5432/db`
- Wrapped quoted values: `"value"` or `'value'` (quotes removed)
- Quotes inside values: `my"pass"word` (quotes preserved)
- Quotes at start/end only: `"password` or `password"` (quotes preserved)
- Values with spaces: `value with spaces`
- Multiple equals signs: `key=value=another=value`
- Shell metacharacters: `!@#$%^&*(){}[]|\/:"<>?`

The `load_env_file` function treats `.env` as pure data, not executable code, preventing command injection and properly handling any character except newlines within values.
