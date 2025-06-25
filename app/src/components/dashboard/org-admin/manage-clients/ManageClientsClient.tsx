"use client";

import * as React from "react";
import { Search, LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTable } from "./ClientTable";
import { ClientKanbanView } from "./ClientKanbanView";
import { getClients } from "@/data/clients";

export function ManageClientsClient() {
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const clients = getClients();

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your user base, teams and access all the details of each user.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 w-full sm:w-64" />
          </div>
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => setView('kanban')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setView('table')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {view === 'table' ? <ClientTable /> : <ClientKanbanView clients={clients} />}
    </div>
  );
}
