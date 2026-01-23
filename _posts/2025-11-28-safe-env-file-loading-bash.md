---
layout: post
title: "Safely Loading .env Files with Special Characters in Bash"
date: 2025-11-28
categories: bash
updates:
    - January 2026 – Fixed issues with special characters in values by using printf instead of echo/sed, and reading full lines instead of splitting on IFS. This was done with the help of Claude Code.
---

When working with `.env` files in shell scripts, special characters can cause unexpected behavior or security issues. The common approach of using `source .env` or `export $(cat .env)` breaks when values contain spaces, quotes, or shell metacharacters.

Let's assume you have an `.env` file like this which does not include any quotes around values:

```
DATABASE_URL=postgresql://user:p@ssw0rd!#$&*()@localhost:5432/dbname
```

Then simply running `source .env` would lead to errors or incorrect variable assignments. Yes, it would be safer to quote values in the `.env` file, but often you don't have control over how that file might be generated.

Here's a robust function that handles special characters safely:

```bash
load_env_file() {
  local env_file="${1:-.env}"
  if [ -f "$env_file" ]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      # Skip comments and empty lines
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "${line// }" ]] && continue

      # Extract key (everything before first =)
      local key="${line%%=*}"
      # Extract value (everything after first =)
      local value="${line#*=}"

      # Skip if no = found
      [[ "$key" == "$line" ]] && continue

      # Remove surrounding quotes from value if present
      if [[ "$value" =~ ^\"(.*)\"$ ]]; then
        value="${BASH_REMATCH[1]}"
      elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
        value="${BASH_REMATCH[1]}"
      fi

      # Export the variable using printf to avoid interpretation of special chars
      printf -v "$key" '%s' "$value"
      export "$key"
    done < "$env_file"
  fi
}
```

How does it work?

1. `IFS= read -r line`: Reads the entire line without field splitting, preserving all characters including leading/trailing whitespace
2. `|| [[ -n "$line" ]]`: Handles files that don't end with a newline
3. Parameter expansion for parsing: `${line%%=*}` gets the key (everything before first `=`), `${line#*=}` gets the value (everything after first `=`)
4. Comment/empty line filtering: Skips lines starting with `#` (with optional leading whitespace) or containing only whitespace
5. Matching quote removal: Only strips quotes if they match at both start and end, preserving quotes that are part of the actual value (e.g., `"password` stays as `"password`)
6. `printf -v`: Assigns the value to the variable without any shell interpretation, unlike `export "$key=$value"` which can have issues with certain characters

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
