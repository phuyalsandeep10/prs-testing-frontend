import { ManageUsersClient } from "@/components/dashboard/org-admin/manage-users/ManageUsersClient";
import { User } from "@/components/dashboard/org-admin/manage-users/columns";
import { Team } from "@/components/dashboard/org-admin/manage-teams/columns";

// Mock data for the users table
const users: User[] = [
  {
    id: "1",
    name: "Yubesh Koirala",
    email: "yubesh@example.com",
    phoneNumber: "+977-9876543210",
    assignedTeam: "Design Wizards",
    status: "Active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phoneNumber: "+977-9876543211",
    assignedTeam: "Team SEO Warriors",
    status: "Invited",
  },
  // Add more mock users as needed
];

// Mock data for the teams table
const teams: Team[] = [
  {
    id: "1",
    teamName: "Design Wizards",
    teamLead: "Yubesh Koirala",
    contactNumber: "+977-9876543210",
    teamMembers: Array.from({ length: 3 }, (_, i) => ({ id: `${i}`, avatar: `https://i.pravatar.cc/150?u=a042581f4e29026704d${i}` })),
    assignedProjects: "Peek Word Landing Page",
    extraProjectsCount: 2,
  },
  {
    id: "2",
    teamName: "Team SEO Warriors",
    teamLead: "Pooja Budhathoki",
    contactNumber: "+977-9876543210",
    teamMembers: Array.from({ length: 7 }, (_, i) => ({ id: `${i}`, avatar: `https://i.pravatar.cc/150?u=a042581f4e29026704e${i}` })),
    assignedProjects: "SEO & SEM, Traffic boost",
    extraProjectsCount: 2,
  },
  {
    id: "3",
    teamName: "Sales Giants",
    teamLead: "Joshna Khadka",
    contactNumber: "+977-9876543210",
    teamMembers: Array.from({ length: 4 }, (_, i) => ({ id: `${i}`, avatar: `https://i.pravatar.cc/150?u=a042581f4e29026704f${i}` })),
    assignedProjects: "Payment Receiving System",
  },
];

const ManageUsersPage = () => {
  return <ManageUsersClient users={users} teams={teams} />;
};

export default ManageUsersPage;
