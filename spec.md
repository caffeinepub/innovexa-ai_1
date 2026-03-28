# Innovexa AI

## Current State
- Internet Identity (II) is used for login; conversations saved in localStorage keyed by II principal
- History sidebar only shown when II is logged in
- Ultra access gated by team username/password (hardcoded)
- No cross-device sync (localStorage is device-local)

## Requested Changes (Diff)

### Add
- Custom account system: username + password stored on the backend
- `createAccount(username, password)` backend function
- `loginAccount(username, password)` backend function returning saved conversations
- `saveUserConversation(username, password, conversation)` backend function
- `deleteUserConversation(username, password, convId)` backend function
- Account modal (popup window) with three options:
  1. **Create Account** — shows username + password form; creates account; enables history
  2. **Log In** — shows username + password form; loads previous chats; enables history
  3. **Continue not signed in** — dismisses modal; no history sidebar shown; small text next to button: "Your history and chats will not be saved"
- History sidebar visible only when logged into a custom account (or Ultra workers)
- Cross-device sync: same username/password on any device → same chat history (backend storage)

### Modify
- Current "Sign In" (II) button triggers the new account modal instead of/in addition to II flow
- History is now stored in the backend per username, not localStorage
- History sidebar shown to: custom account users + Ultra workers
- Not signed in: no history sidebar at all

### Remove
- localStorage-based conversation storage for II users (replaced by backend account storage)

## Implementation Plan
1. Add Motoko backend functions: createAccount, loginAccount, saveUserConversation, deleteUserConversation, getUserConversations
2. Store accounts as a HashMap(username -> (passwordHash, [conversation]))
3. Add AccountModal component in frontend with Create Account / Log In / Continue not signed in tabs/views
4. Add small text "Your history and chats will not be saved" next to Continue not signed in button
5. When logged into account: fetch conversations from backend on mount, save to backend on each message
6. Replace localStorage history with backend history calls
7. Show history sidebar only when `accountUser` is set
