# G4Gate Interactive Behaviors & Client-Side Functionality

This document details all interactive UI elements, client-side state handling, event listeners, and user interaction patterns observed on `https://g4gate.com`.

---

## 1. Authentication Form Interactions

### A. Quick Domain Autocompletion Helper (`@gmail.com`)

**Status:** **[Observed & Code-Verified]**  
**Source Location:** Chunk `410eh9dg3j4na.js`

On both the `/login` and `/signup` screens, immediately underneath the username/email input field, a quick-action button pill labeled `@gmail.com` is rendered.

#### Observed Implementation:
```javascript
["gmail.com"].map(e => {
  let r = G.includes("@") ? G.split("@")[0] : G,
      l = G.toLowerCase().endsWith("@" + e);
  return (0, t.jsxs)("button", {
    type: "button",
    onClick: () => C((r || "") + "@" + e),
    className: `text-[11px] font-semibold px-2.5 py-1 rounded-md border transition ${
      l 
        ? "bg-blue-600/20 text-blue-400 border-blue-500/40" 
        : "bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600"
    }`
  });
});
```

#### Behavior:
1. When clicked, it isolates the string prefix before any existing `@` character.
2. It immediately appends `@gmail.com` to the current input value and updates component state.
3. If the input already ends with `@gmail.com`, the button switches to an active highlighted style (`bg-blue-600/20 text-blue-400 border-blue-500/40`).

---

### B. Password Visibility Toggle

**Status:** **[Observed & Code-Verified]**  
**Source Location:** Chunk `410eh9dg3j4na.js`

The password input field contains an inline icon button positioned absolutely at the right-hand edge:

```javascript
<button
  type="button"
  onClick={() => setPasswordVisible(v => !v)}
  aria-label={passwordVisible ? "Hide password" : "Show password"}
  aria-pressed={passwordVisible}
  className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
>
  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
```

#### Accessibility Features:
- Dynamically updates `aria-label` to announce "Show password" vs "Hide password".
- Sets `aria-pressed="true"` when visible.
- Does not cause form submission because `type="button"` is explicitly enforced.

---

### C. Google OAuth Sign-In (GSI Integration)

**Status:** **[Observed]**  
**Client ID:** `395551106272-7r2qkfqed2oblsp7ned8pqdu1od1eeaj.apps.googleusercontent.com`

The application uses `@react-oauth/google` with Google Identity Services:

```javascript
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={() => {
    setIsSubmitting(false);
    setErrorMessage("Google Login Failed. Close any blank Google window and try again.");
  }}
  theme="filled_black"
  shape="circle"
  itp_support={true}
  containerProps={{ style: { colorScheme: "light" } }}
/>
```

#### Interaction States:
1. **Initial State:** Standard circular Google "Sign in with Google" button inside an iframe.
2. **Pending / Processing State:** Once credentials are authenticated by Google, the button unmounts and is replaced by:
   ```jsx
   <div className="flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-300">
     <Loader2 size={18} className="animate-spin" />
     Completing Google sign-in…
   </div>
   ```
3. **Server Action Bridge:** The client token is forwarded to the `googleAuthServer` Next.js server reference (`40cf8f2bd306d6fcbb0d3226ce2d1b31f6a8de42cf`).
4. **Error Handling:** If Google fails or popup is blocked, a dedicated error notice is displayed:
   `"Google Login Failed. Close any blank Google window and try again."`

---

## 2. Form Error & Warning Display Mechanism

**Status:** **[Observed]**

All auth pages use a unified warning/error banner style rendered directly above the primary action or beneath the social login separator:

```jsx
{errorMessage && (
  <div className="mb-5 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-center text-xs leading-relaxed text-amber-300">
    {errorMessage}
  </div>
)}
```

Notice the specific styling choice:
- Not bright red, but high-contrast amber/yellow (`text-amber-300`, `bg-amber-950/30`, `border-amber-800/50`) designed to maintain a sleek dark aesthetic while remaining clearly legible.

---

## 3. Registration (Signup) Flow & Fields

**Status:** **[Observed]**  
**Source Location:** Chunk `2dj8cy_q8ekjx.js`

The signup page (`/signup`) requires 4 distinct inputs:

| Field | Input Type | Required | Placeholder | Helper / Validation Text |
|---|---|---|---|---|
| **Full Name** | `text` | Yes | `E.g. John Doe` | None |
| **Email Address** | `email` | Yes | `you@example.com` | `"We'll send a code here to confirm it — use an address you can actually open."` |
| **Username** | `text` | Yes | `e.g. arjun_verma` | Lowercase/alphanumeric identifier |
| **Password** | `password` | Yes | `••••••••` | Masked with Eye toggle |

### Existing Account Detection:
If the user inputs an email already registered in the system, the form dynamically surfaces:
- Heading: `"You already have an account"`
- Link: `"Don't know this password? Reset here"`
- Option: `"Back to sign up"`

---

## 4. Password Recovery Flow

**Status:** **[Observed]**  
**Source Location:** Chunk `1lie_a0fgel2q.js`

1. Endpoint: `/forgot-password`
2. Form fields:
   - Email Input: `placeholder="you@example.com"`
   - Helper label: `"Enter your email and we'll send you a link to reset your password."`
3. Primary button: `"Send Reset Link"`
4. Back link: `"Back to Login"`

---

## 5. Global Interactive Components

### Copy Email to Clipboard
In the global footer, clicking the `contact@g4gate.com` button executes the modern `navigator.clipboard.writeText('contact@g4gate.com')` API and flips the SVG icon from a copy icon to a checkmark icon for 2000ms.
