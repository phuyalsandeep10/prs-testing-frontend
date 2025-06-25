import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const organizations = [
  { id: 1, name: 'TechCorp', admin: 'john.doe@techcorp.com', status: 'Active' },
  { id: 2, name: 'HealthWell', admin: 'jane.smith@healthwell.com', status: 'Active' },
  { id: 3, name: 'FinancePro', admin: 'sam.wilson@financepro.com', status: 'Inactive' },
];

export default function OrganizationsPage() {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organizations</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the organizations in the system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/super-admin/organizations/new">
            <Button>Add organization</Button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization Name</TableHead>
                  <TableHead>Admin Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Edit</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.admin}</TableCell>
                    <TableCell>{org.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" asChild>
                        <Link href="#">Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
