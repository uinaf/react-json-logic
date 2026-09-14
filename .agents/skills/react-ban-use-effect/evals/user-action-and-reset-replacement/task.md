# Replace Event-Flag and Reset Effects

## Problem/Feature Description

A form component uses one effect to notice a `shouldSubmit` flag after a button click and another effect to reset local draft state when the selected user changes. Refactor it without direct `useEffect`.

Keep user-caused work in the event handler. Use a keyed boundary or render-time derivation for reset semantics. Do not rewrite unrelated form behavior.

## Output Specification

Produce:

- `src/UserEditor.tsx` with the refactored code
- `effect-replacement-report.md` summarizing the replacement choices

## Input Files

=============== FILE: src/UserEditor.tsx ===============
import { useEffect, useState } from "react";

type User = { id: string; name: string };

async function saveUser(userId: string, name: string) {
  await fetch(`/api/users/${userId}`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function UserEditor({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  useEffect(() => {
    setName(user.name);
  }, [user.id, user.name]);

  useEffect(() => {
    if (!shouldSubmit) return;
    setShouldSubmit(false);
    void saveUser(user.id, name);
  }, [shouldSubmit, user.id, name]);

  return (
    <form>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="button" onClick={() => setShouldSubmit(true)}>
        Save
      </button>
    </form>
  );
}
=============== END FILE ===============
