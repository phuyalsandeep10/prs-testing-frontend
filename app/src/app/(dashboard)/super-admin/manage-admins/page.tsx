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

const admins = [
  { id: 1, name: 'John Doe', email: 'john.doe@techcorp.com', organization: 'TechCorp', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@healthwell.com', organization: 'HealthWell', status: 'Active' },
  { id: 3, name: 'Sam Wilson', email: 'sam.wilson@financepro.com', organization: 'FinancePro', status: 'Inactive' },
];

export default function ManageAdminsPage() {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Admins</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the organization admins.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/super-admin/manage-admins/new">
            <Button>Add admin</Button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Edit</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.organization}</TableCell>
                    <TableCell>{admin.status}</TableCell>
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
