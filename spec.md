# Innovexa AI

## Current State
The app has an Ultra sign-in (username/password for team members). Internet Identity is provisioned (InternetIdentityProvider wraps App, useInternetIdentity hook exists) but not used in the UI. Conversations are stored only in React state -- lost on reload. No II login button exists in the UI.

## Requested Changes (Diff)

### Add
- Internet Identity login button in the landing page nav and mode-select header
- When signed in via II, save all chat messages to localStorage keyed by the user's principal ID
- Load saved conversations from localStorage on II login
- Show a small conversation history panel/list when signed in via II (accessible from chat screen or mode-select)
- The II login button UI must say "Powered by Innovexa Secure Login" (not "Powered by Internet Identity")
- The II login flow context text should say "Log in to Innovexa.ai"

### Modify
- App component: import and use `useInternetIdentity` to get `identity`, `login`, `clear`
- When II identity is available, auto-save messages to localStorage after each `handleSendMessage` call
- Landing nav: add a "Sign In" button that triggers II login; when signed in show principal short ID + logout
- Mode-select and chat screens: show II login status

### Remove
- Nothing existing is removed

## Implementation Plan
1. In `App.tsx`, import `useInternetIdentity` from `./hooks/useInternetIdentity`
2. Add state + logic to save/load conversations from localStorage keyed by `identity.getPrincipal().toText()`
3. Add II login button (styled to match dark theme) in the landing nav and mode-select header; button label: "Sign In"; below/near button show small text "Powered by Innovexa Secure Login"
4. When II identity is present, after each AI reply, save full messages array to localStorage as `innovexa_conv_<principal>`
5. When II identity becomes available, load saved conversation from localStorage and offer to restore it
6. Show a conversation history list when signed in (can be a small dropdown or sidebar with past conversation sessions)
7. Show logout option when signed in
