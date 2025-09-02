"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent, agentsApi } from "@/user.interface/_core/services/api/agents";
import { useRBAC } from "@/user.interface/_core/hooks/useRBAC";

// Simulated role from auth (replace with Supabase session later)
const useAuth = () => ({
    role: "agent" as "admin" | "agent" | "farmer",
    userId: "agent1",
});

export default function AgentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useQuery({
        queryKey: ["agent", id],
        queryFn: () => agentsApi.get(id),
    });



    if (isLoading) return <p>Loading...</p>;

    
    return (
        <div className="p-6">
        <Card className="bg-[rgb(var(--color-card))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] max-w-md">
            <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent>
                <AgentWrapper/>
            </CardContent>
        </Card>
        </div>
    )


}

interface AgentWrapperProps {
    agent: Agent
}

function AgentWrapper({
    agent,
}: AgentWrapperProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: "", teamName: "", active: true });
    const authUser = useAuth();
    const rbac = useRBAC(authUser, { userId: authUser.userId }); 

    const mutation = useMutation({
        mutationFn: (updates: typeof form) => agentsApi.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
            router.push("/dashboard/agents");
        },
    });


    useEffect(() => {
        if (agent) setForm({ name: agent.name, teamName: agent.teamName, active: agent.active });
    }, [agent]);



    return (
        <div className="space-y-4">
        <Input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Name"
        disabled={!rbac.canEdit}
        className="bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))]"
        />
        <Input
        value={form.teamName}
        onChange={(e) => setForm({ ...form, teamName: e.target.value })}
        placeholder="Team Name"
        disabled={!rbac.canEdit}
        className="bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))]"
        />
        <label className="flex items-center gap-2">
        <input
        type="checkbox"
        checked={form.active}
        onChange={(e) => setForm({ ...form, active: e.target.checked })}
        disabled={!rbac.canEdit}
        />
        Active
        </label>

        <div className="flex gap-2">
        {rbac.canEdit && (
            <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            >
            Save
            </Button>
        )}
        <Button variant="secondary" onClick={() => router.back()}>
        Back
        </Button>
        {rbac.canEdit && agent?.deletedAt && (
            <Button
            variant="secondary"
            onClick={() => {
                agentsApi.restore(agent.id).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["agents"] });
                    router.push("/dashboard/agents");
                });
            }}
            >
            Restore
            </Button>
        )}
        </div>
        </div>
    )
}
