# Workflow Rules for BreastCare AI

## Code & UI Edits in `mammography_ai`

1. **Strict Directory Scope**: All code modifications or file removals requested by the user for `mammography_ai` must be performed directly inside `c:\Users\siddh\Desktop\BreastCare_AI\mammography_ai`.
2. **No Git Background Commands**: DO NOT execute `git` commands (e.g., `git log`, `git show`, `git status`, `git diff`) in the terminal unless the user explicitly requests you to run git commands. Inspect and read workspace files directly using file viewing/search tools instead.
3. **Seamless Reversibility & Safe Undo**:
   - Every file modification or deletion must be clean and atomic.
   - When the user asks to undo changes ("undo kro" / "pehle jaise kro"), restore the files to their exact pre-modified state cleanly.
   - Never overwrite production static assets in `mammography_ai/web/assets` with unconfigured dev builds that could destroy the working UI.
