# Replace Derived State and Fetch Effects

## Problem/Feature Description

A React component uses direct `useEffect` for two jobs: deriving filtered rows from props and fetching server state. The repository already uses the TanStack Query library and has a `queryOptions` helper pattern.

Refactor the component so the touched surface has no direct `useEffect` import or call. Preserve behavior and use the existing data layer pattern instead of adding a new dependency.

## Output Specification

Produce:

- `src/ProjectsTable.tsx` with the refactored component
- `refactor-notes.md` explaining each replaced effect category and verification to run

## Input Files

=============== FILE: src/ProjectsTable.tsx ===============
import { useEffect, useState } from "react";

type Project = { id: string; name: string; archived: boolean };

export function ProjectsTable({ showArchived }: { showArchived: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visible, setVisible] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then(setProjects);
  }, []);

  useEffect(() => {
    setVisible(projects.filter((project) => showArchived || !project.archived));
  }, [projects, showArchived]);

  return (
    <ul>
      {visible.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
=============== END FILE ===============

=============== FILE: src/queries.ts ===============
import { queryOptions } from "@tanstack/react-query";

export const projectsQuery = () =>
  queryOptions({
    queryKey: ["projects"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/projects", { signal });
      if (!response.ok) throw new Error("projects request failed");
      return (await response.json()) as Array<{ id: string; name: string; archived: boolean }>;
    },
  });
=============== END FILE ===============
