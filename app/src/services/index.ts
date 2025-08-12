import { 
  User, 
  Client, 
  Team, 
  CommissionData, 
  CreateInput, 
  UpdateInput,
  UserRole,
  PaginatedResponse,
  DashboardStats
} from '@/types';
import { 
  userApi, 
  clientApi, 
  teamApi 
} from '@/lib/api-client';

// Note: commissionApi and dashboardApi may need to be implemented in api-client
// enableMockData flag - temporarily hardcoded for migration
const enableMockData = false;

// Temporary placeholder APIs for commission and dashboard
const commissionApi = {
  getAll: async (params: any) => { throw new Error('Commission API not yet implemented'); },
  update: async (data: any) => { throw new Error('Commission API not yet implemented'); },
  bulkUpdate: async (data: any) => { throw new Error('Commission API not yet implemented'); },
  export: async (format: string, filters: any) => { throw new Error('Commission API not yet implemented'); },
};

const dashboardApi = {
  getStats: async (role: any) => { throw new Error('Dashboard API not yet implemented'); },
};

// ==================== MOCK DATA (Development Only) ====================
import { getClients, getClientById } from '@/data/clients';

// Mock data - should be moved to proper API when available
const mockUsers: User[] = [
  {
    id: "1",
    name: "Yubesh Koirala",
    email: "yubesh@example.com",
    phoneNumber: "+977-9876543210",
    role: "salesperson",
    assignedTeam: "Design Wizards",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phoneNumber: "+977-9876543211",
    role: "verifier",
    assignedTeam: "Team SEO Warriors",
    status: "invited",
  },
];

const mockTeams: Team[] = [
  {
    id: "1",
    teamName: "Design Wizards",
    teamLead: "Yubesh Koirala",
    contactNumber: "+977-9876543210",
    teamMembers: [
      { id: "1", name: "John Doe", avatar: "/avatars/01.png" },
      { id: "2", name: "Jane Smith", avatar: "/avatars/02.png" },
    ],
    assignedProjects: "Peek Word Landing Page",
    extraProjectsCount: 2,
  },
];

const mockCommissionData: CommissionData[] = [
  {
    id: "1",
    fullName: "Yubesh Parsad Koirala",
    totalSales: 200000,
    currency: "NEP",
    rate: 1,
    percentage: 5,
    bonus: 20000,
    penalty: 0,
    convertedAmt: 10000,
    total: 30000,
    totalReceivable: 30000,
  },
];

// ==================== HELPER FUNCTIONS ====================
function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
  };
}

async function executeWithFallback<T>(
  apiCall: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  if (enableMockData) {
    return fallback();
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, falling back to mock data:', error);
    return fallback();
  }
}

// ==================== USER SERVICE ====================
export class UserService {
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
  }): Promise<PaginatedResponse<User>> {
    return executeWithFallback(
      async () => {
        const response = await userApi.getAll(params || {});
        return response;
      },
      () => {
        let filteredData = mockUsers;
        
        if (params?.search) {
          filteredData = filteredData.filter(user =>
            user.name.toLowerCase().includes(params.search!.toLowerCase()) ||
            user.email.toLowerCase().includes(params.search!.toLowerCase())
          );
        }
        
        if (params?.role) {
          filteredData = filteredData.filter(user => user.role === params.role);
        }
        
        return createPaginatedResponse(
          filteredData,
          params?.page,
          params?.limit
        );
      }
    );
  }

  static async getUserById(id: string): Promise<User> {
    return executeWithFallback(
      async () => {
        const response = await userApi.getById(id);
        return response.data;
      },
      () => {
        const user = mockUsers.find(u => u.id === id);
        if (!user) throw new Error(`User with id ${id} not found`);
        return user;
      }
    );
  }

  static async createUser(userData: CreateInput<User>): Promise<User> {
    return executeWithFallback(
      async () => {
        const response = await userApi.create(userData);
        return response.data;
      },
      () => {
        const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        return newUser;
      }
    );
  }

  static async updateUser(userData: UpdateInput<User>): Promise<User> {
    return executeWithFallback(
      async () => {
        const response = await userApi.update(userData);
        return response.data;
      },
      () => {
        const index = mockUsers.findIndex(u => u.id === userData.id);
        if (index === -1) throw new Error(`User with id ${userData.id} not found`);
        
        mockUsers[index] = { ...mockUsers[index], ...userData };
        return mockUsers[index];
      }
    );
  }

  static async deleteUser(id: string): Promise<void> {
    return executeWithFallback(
      async () => {
        await userApi.delete(id);
      },
      () => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) throw new Error(`User with id ${id} not found`);
        mockUsers.splice(index, 1);
      }
    );
  }

  static async changeUserStatus(id: string, status: User['status']): Promise<User> {
    return executeWithFallback(
      async () => {
        const response = await userApi.changeStatus(id, status);
        return response.data;
      },
      () => {
        const user = mockUsers.find(u => u.id === id);
        if (!user) throw new Error(`User with id ${id} not found`);
        user.status = status;
        return user;
      }
    );
  }
}

// ==================== CLIENT SERVICE ====================
export class ClientService {
  static async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<PaginatedResponse<Client>> {
    return executeWithFallback(
      async () => {
        const response = await clientApi.getAll(params || {});
        return response;
      },
      () => {
        let filteredData = getClients();
        
        if (params?.search) {
          filteredData = filteredData.filter(client =>
            client.name.toLowerCase().includes(params.search!.toLowerCase()) ||
            client.email.toLowerCase().includes(params.search!.toLowerCase()) ||
            client.salesperson.toLowerCase().includes(params.search!.toLowerCase())
          );
        }
        
        if (params?.category) {
          filteredData = filteredData.filter(client => client.category === params.category);
        }
        
        if (params?.status) {
          filteredData = filteredData.filter(client => client.status === params.status);
        }
        
        return createPaginatedResponse(
          filteredData,
          params?.page,
          params?.limit
        );
      }
    );
  }

  static async getClientById(id: string): Promise<Client> {
    return executeWithFallback(
      async () => {
        const response = await clientApi.getById(id);
        return response.data;
      },
      () => {
        const client = getClientById(id);
        if (!client) throw new Error(`Client with id ${id} not found`);
        return client;
      }
    );
  }

  static async createClient(clientData: CreateInput<Client>): Promise<Client> {
    return executeWithFallback(
      async () => {
        const response = await clientApi.create(clientData);
        return response.data;
      },
      () => {
        const newClient: Client = {
          ...clientData,
          id: `client-${Date.now()}`,
          createdAt: new Date().toISOString(),
          activities: [],
          avatarUrl: '/avatars/default.png',
          salesLeadsAvatars: [],
        };
        return newClient;
      }
    );
  }

  static async updateClient(clientData: UpdateInput<Client>): Promise<Client> {
    return executeWithFallback(
      async () => {
        const response = await clientApi.update(clientData);
        return response.data;
      },
      () => {
        const client = getClientById(clientData.id!);
        if (!client) throw new Error(`Client with id ${clientData.id} not found`);
        return { ...client, ...clientData };
      }
    );
  }

  static async deleteClient(id: string): Promise<void> {
    return executeWithFallback(
      async () => {
        await clientApi.delete(id);
      },
      () => {
        // Mock deletion - in real app this would remove from database
        console.log(`Client ${id} deleted`);
      }
    );
  }
}

// ==================== TEAM SERVICE ====================
export class TeamService {
  static async getTeams(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Team>> {
    return executeWithFallback(
      async () => {
        const response = await teamApi.getAll(params || {});
        return response;
      },
      () => {
        let filteredData = mockTeams;
        
        if (params?.search) {
          filteredData = filteredData.filter(team =>
            team.teamName.toLowerCase().includes(params.search!.toLowerCase()) ||
            team.teamLead.toLowerCase().includes(params.search!.toLowerCase())
          );
        }
        
        return createPaginatedResponse(
          filteredData,
          params?.page,
          params?.limit
        );
      }
    );
  }

  static async getTeamById(id: string): Promise<Team> {
    return executeWithFallback(
      async () => {
        const response = await teamApi.getById(id);
        return response.data;
      },
      () => {
        const team = mockTeams.find(t => t.id === id);
        if (!team) throw new Error(`Team with id ${id} not found`);
        return team;
      }
    );
  }

  static async createTeam(teamData: CreateInput<Team>): Promise<Team> {
    return executeWithFallback(
      async () => {
        const response = await teamApi.create(teamData);
        return response.data;
      },
      () => {
        const newTeam: Team = {
          ...teamData,
          id: `team-${Date.now()}`,
          createdAt: new Date().toISOString(),
          teamMembers: teamData.teamMembers || [],
          extraProjectsCount: 0,
        };
        mockTeams.push(newTeam);
        return newTeam;
      }
    );
  }

  static async updateTeam(teamData: UpdateInput<Team>): Promise<Team> {
    return executeWithFallback(
      async () => {
        const response = await teamApi.update(teamData);
        return response.data;
      },
      () => {
        const index = mockTeams.findIndex(t => t.id === teamData.id);
        if (index === -1) throw new Error(`Team with id ${teamData.id} not found`);
        
        mockTeams[index] = { ...mockTeams[index], ...teamData };
        return mockTeams[index];
      }
    );
  }

  static async deleteTeam(id: string): Promise<void> {
    return executeWithFallback(
      async () => {
        await teamApi.delete(id);
      },
      () => {
        const index = mockTeams.findIndex(t => t.id === id);
        if (index === -1) throw new Error(`Team with id ${id} not found`);
        mockTeams.splice(index, 1);
      }
    );
  }
}

// ==================== COMMISSION SERVICE ====================
export class CommissionService {
  private static calculateCommission(data: Omit<CommissionData, 'convertedAmt' | 'total' | 'totalReceivable'>): CommissionData {
    const convertedAmt = (data.totalSales * data.percentage) / 100;
    const total = convertedAmt + data.bonus - data.penalty;
    
    return {
      ...data,
      convertedAmt,
      total,
      totalReceivable: total,
    };
  }

  static async getCommissionData(params?: {
    page?: number;
    limit?: number;
    search?: string;
    currency?: string;
  }): Promise<PaginatedResponse<CommissionData>> {
    return executeWithFallback(
      async () => {
        const response = await commissionApi.getAll(params || {});
        return response;
      },
      () => {
        let filteredData = mockCommissionData;
        
        if (params?.search) {
          filteredData = filteredData.filter(commission =>
            commission.fullName.toLowerCase().includes(params.search!.toLowerCase())
          );
        }
        
        if (params?.currency) {
          filteredData = filteredData.filter(commission => commission.currency === params.currency);
        }
        
        return createPaginatedResponse(
          filteredData,
          params?.page,
          params?.limit
        );
      }
    );
  }

  static async updateCommission(commissionData: UpdateInput<CommissionData>): Promise<CommissionData> {
    return executeWithFallback(
      async () => {
        const response = await commissionApi.update(commissionData);
        return response.data;
      },
      () => {
        const index = mockCommissionData.findIndex(c => c.id === commissionData.id);
        if (index === -1) throw new Error(`Commission data with id ${commissionData.id} not found`);
        
        const updatedData = { ...mockCommissionData[index], ...commissionData };
        const calculatedData = this.calculateCommission(updatedData);
        mockCommissionData[index] = calculatedData;
        return calculatedData;
      }
    );
  }

  static async bulkUpdateCommission(commissionDataArray: UpdateInput<CommissionData>[]): Promise<CommissionData[]> {
    return executeWithFallback(
      async () => {
        const response = await commissionApi.bulkUpdate(commissionDataArray);
        return response.data;
      },
      () => {
        return commissionDataArray.map(commissionData => {
          const index = mockCommissionData.findIndex(c => c.id === commissionData.id);
          if (index !== -1) {
            const updatedData = { ...mockCommissionData[index], ...commissionData };
            const calculatedData = this.calculateCommission(updatedData);
            mockCommissionData[index] = calculatedData;
            return calculatedData;
          }
          throw new Error(`Commission data with id ${commissionData.id} not found`);
        });
      }
    );
  }

  static async exportCommission(format: 'csv' | 'pdf', filters?: Record<string, unknown>): Promise<Blob> {
    return executeWithFallback(
      async () => {
        const response = await commissionApi.export(format, filters);
        return response.data;
      },
      () => {
        // Mock export - create a simple blob
        const content = `Commission Data Export (${format})\nGenerated: ${new Date().toISOString()}`;
        return new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      }
    );
  }
}

// ==================== DASHBOARD SERVICE ====================
export class DashboardService {
  static async getDashboardStats(role: UserRole): Promise<DashboardStats> {
    return executeWithFallback(
      async () => {
        const response = await dashboardApi.getStats(role);
        return response.data;
      },
      () => {
        // Mock dashboard stats based on role
        return {
          totalUsers: mockUsers.length,
          activeUsers: mockUsers.filter(u => u.status === 'active').length,
          totalClients: getClients().length,
          totalTeams: mockTeams.length,
          totalRevenue: mockCommissionData.reduce((sum, c) => sum + c.totalSales, 0),
          totalCommission: mockCommissionData.reduce((sum, c) => sum + c.totalReceivable, 0),
          monthlyGrowth: 12.5,
          recentActivities: [],
          notifications: [],
        };
      }
    );
  }
}

// ==================== ERROR HANDLING ====================
export const handleServiceError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ==================== EXPORT SERVICES ====================
export const userService = UserService;
export const clientService = ClientService;
export const teamService = TeamService;
export const commissionService = CommissionService;
export const dashboardService = DashboardService; 