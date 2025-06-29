import React from 'react';

export default function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout can be expanded to include logic or UI specific to the org-admin role.
  return <>{children}</>;
}
