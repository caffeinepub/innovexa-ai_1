# Innovexa AI

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A web chat application that lets users converse with "Innovexa AI"
- The AI is powered by the Google Gemini API (gemini-2.5-flash) via backend HTTP outcalls
- The AI has a custom system prompt: it is named "Innovexa AI", is professional and helpful, and was created by "Aahrone Bakhvala"
- No mention of Gemini, Google, or any underlying model anywhere in the UI or responses
- Three thinking/model modes selectable by the user:
  - **Fast** -- quick responses (no thinking budget / low token budget)
  - **Thinking** -- balanced responses (medium thinking)
  - **Pro** -- thorough, high-quality responses (maximum thinking budget)
- Persistent chat session per browser session (conversation history maintained)
- Clean "exit" / new conversation button

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko + HTTP Outcalls)
1. Store the Gemini API key securely server-side (hardcoded for now)
2. Expose a `sendMessage` endpoint that accepts:
   - The full conversation history (array of role/content pairs)
   - The new user message
   - The selected mode: `#fast`, `#thinking`, or `#pro`
3. Map modes to Gemini `thinkingConfig.thinkingBudget`:
   - Fast: 0 (disabled)
   - Thinking: 8192
   - Pro: 24576
4. Call `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` with the system instruction and conversation history
5. Return the assistant text response

### Frontend (React + TypeScript)
1. Landing / mode selection screen: user picks Fast, Thinking, or Pro before starting
2. Chat screen:
   - Message list with user and Innovexa AI bubbles
   - Input box + send button
   - Mode badge / switcher in header
   - New conversation button
3. Loading state while waiting for response
4. Error state if the API call fails
5. Polish: professional, premium look -- no Gemini branding anywhere
