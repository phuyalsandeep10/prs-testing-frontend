export interface Activity {
  timestamp: string;
  description: string;
}

export type ClientCategory = 'In consistent' | 'Loyal' | 'Occasional';
export type ClientStatus = "Clear" | "Pending" | "Bad Depth";
export type ClientSatisfaction = "Positive" | "Neutral" | "Negative";

export interface Client {
  id: string;
  name: string;
  email: string;
  category: ClientCategory;
  salesperson: string;
  lastContact: string;
  expectedClose: string;
  value: number;
  status: ClientStatus;
  satisfaction: ClientSatisfaction;
  remarks: string;
  primaryContactName: string;
  primaryContactPhone: string;
  address: string;
  activeDate: string;
  activities: Activity[];
  avatarUrl: string;
  salesLeadsAvatars: string[];
}

const mockClients: Client[] = [
  {
    id: 'PRS-00123',
    name: 'Bhanu Bhakta Acharya',
    email: 'bhanubhaktaacharya88@gmail.com',
    category: 'Loyal',
    salesperson: 'Kushal Shrestha',
    lastContact: 'May 28, 2025',
    expectedClose: 'Jun 15, 2025',
    value: 150000,
    status: 'Clear',
    satisfaction: 'Positive',
    remarks: 'Client is happy with the progress.',
    primaryContactName: 'Kushal Rai',
    primaryContactPhone: '+977 9842367167',
    address: 'Itahari, Sunsari, Nepal',
    activeDate: 'May 28, 2025',
    activities: [
      { timestamp: 'May 28, 2025 - 10:30 AM', description: 'Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.' },
      { timestamp: 'May 27, 2025 - 02:00 PM', description: 'Follow-up call regarding the new proposal. Sent updated quote.' },
    ],
    avatarUrl: '/avatars/01.png',
    salesLeadsAvatars: ['/avatars/01.png', '/avatars/02.png'],
  },
  {
    id: 'PRS-00124',
    name: 'Yubesh Koirala',
    email: 'yubesh.koirala@example.com',
    category: 'In consistent',
    salesperson: 'Abinash Babu Tiwari',
    lastContact: 'May 28, 2025',
    expectedClose: 'Jun 19, 2025',
    value: 150000,
    status: 'Pending',
    satisfaction: 'Neutral',
    remarks: 'Awaiting feedback on the latest design.',
    primaryContactName: 'Yubesh Koirala',
    primaryContactPhone: '+977 9812345678',
    address: 'Kathmandu, Nepal',
    activeDate: 'May 20, 2025',
    activities: [],
    avatarUrl: '/avatars/02.png',
    salesLeadsAvatars: ['/avatars/03.png', '/avatars/04.png'],
  },
  {
    id: 'PRS-00125',
    name: 'Abinash Babu Tiwari',
    email: 'abinash.tiwari@example.com',
    category: 'Loyal',
    salesperson: 'Yubesh Koirala',
    lastContact: 'May 28, 2025',
    expectedClose: 'Oct 15, 2025',
    value: 200000,
    status: 'Clear',
    satisfaction: 'Positive',
    remarks: 'Long-term client, very satisfied.',
    primaryContactName: 'Abinash Babu Tiwari',
    primaryContactPhone: '+977 9823456789',
    address: 'Pokhara, Nepal',
    activeDate: 'Jan 10, 2024',
    activities: [],
    avatarUrl: '/avatars/03.png',
    salesLeadsAvatars: ['/avatars/05.png', '/avatars/01.png'],
  },
  {
    id: 'PRS-00126',
    name: 'Reewaz Bhetwal',
    email: 'reewaz.bhetwal@example.com',
    category: 'Occasional',
    salesperson: 'Joshna Khadka',
    lastContact: 'May 28, 2025',
    expectedClose: 'Jul 15, 2025',
    value: 150000,
    status: 'Bad Depth',
    satisfaction: 'Negative',
    remarks: 'Project has some issues.',
    primaryContactName: 'Reewaz Bhetwal',
    primaryContactPhone: '+977 9834567890',
    address: 'Biratnagar, Nepal',
    activeDate: 'Apr 01, 2025',
    activities: [],
    avatarUrl: '/avatars/04.png',
    salesLeadsAvatars: ['/avatars/02.png', '/avatars/03.png'],
  },
];

export const getClients = (): Client[] => mockClients;

export const getClientById = (id: string): Client | undefined => mockClients.find(client => client.id === id);
