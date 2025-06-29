import React from 'react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout can be expanded to include logic or UI specific to the super-admin role.
  return <>{children}</>;
}
