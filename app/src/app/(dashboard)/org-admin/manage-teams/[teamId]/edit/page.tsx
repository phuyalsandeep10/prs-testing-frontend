"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
});

// Mock function to fetch team data
const getTeamById = async (teamId: string) => {
  console.log(`Fetching team data for ID: ${teamId}`);
  // In a real app, you would fetch this from your API
  return {
    id: teamId,
    name: "Team Alpha", // Mock data
  };
};

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (teamId) {
      const fetchTeam = async () => {
        const team = await getTeamById(teamId);
        form.reset({ name: team.name });
      };
      fetchTeam();
    }
  }, [teamId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual API call to update the team
      console.log(`Updating team ${teamId} with:`, values);
      toast.success("Team updated successfully!");
      router.push("/org-admin/manage-users?tab=teams");
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Team Name</h1>
        <p className="text-sm text-muted-foreground">
          Update the team name below.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-6 border rounded-lg bg-white">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild disabled={isLoading}>
              <Link href="/org-admin/manage-users?tab=teams">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
