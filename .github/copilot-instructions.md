# GitHub Copilot Agent Instructions — Python venv Enforcement

## Rule: Always activate the virtual environment before any shell command

Before executing **any** shell command, the agent MUST ensure the Python
virtual environment is active. This applies to every terminal invocation
without exception: `pip`, `python`, `pytest`, CLI tools, and scripts.

---

## Step 1 — Find the virtual environment

Check in this order:

1. `.venv/` in the project root → **use this** (most common)
2. `venv/` in the project root
3. `env/` in the project root
4. `VIRTUAL_ENV` environment variable set → already active, skip activation
5. If none exist: **create one first**
   ```bash
   python -m venv .venv
   ```

---

## Step 2 — Activate before every command block

**Linux / macOS:**
```bash
source .venv/bin/activate
```

**Windows PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows CMD:**
```bat
.venv\Scripts\activate.bat
```

Always prepend activation to multi-step command blocks:

```bash
source .venv/bin/activate

pip install -r requirements.txt
pytest tests/
python src/main.py
```

For one-liners, use the explicit venv binary path:

```bash
.venv/bin/python -m pytest tests/
.venv/bin/pip install httpx
```

---

## Step 3 — Verify (when uncertain)

```bash
which python   # Must point inside .venv/
python --version
```

If `which python` does not resolve to a path inside `.venv/`, stop and
fix the environment before proceeding.

---

## Toolchain overrides

| Tool | Preferred command |
|---|---|
| `uv` | `uv run <cmd>` or `source .venv/bin/activate` |
| `poetry` | `poetry run <cmd>` |
| `hatch` | `hatch run <cmd>` |
| `pipenv` | `pipenv run <cmd>` |
| `conda` | `conda activate <env-name>` |

---

## Never do this

```bash
# ❌ Wrong — no venv context
pip install requests
python manage.py migrate
pytest

# ✅ Correct
source .venv/bin/activate
pip install requests
python manage.py migrate
pytest
```

---

*This instruction file is enforced for all Copilot agent sessions in this
repository. Do not bypass venv activation even for "quick" commands.*