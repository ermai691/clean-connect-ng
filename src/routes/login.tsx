import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => <Navigate to="/auth/$role" params={{ role: "customer" }} replace />,
});
