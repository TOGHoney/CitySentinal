"use client";

import { UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FineRulesView } from "@/components/profile/fine-rules-view";
import { AlertConfigView } from "@/components/profile/alert-config-view";
import { ChangePasswordView } from "@/components/profile/change-password-view";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <UserRound className="h-6 w-6 text-primary" /> Profile &amp; Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your authority account, review the fine structure, AI detection thresholds and sign-in credentials.
        </p>
      </div>

      <ProfileHeader />

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account &amp; password</TabsTrigger>
          <TabsTrigger value="fines">Fine rules</TabsTrigger>
          <TabsTrigger value="alerts">Detection thresholds</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-4">
          <ChangePasswordView />
        </TabsContent>
        <TabsContent value="fines" className="mt-4">
          <FineRulesView />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <AlertConfigView />
        </TabsContent>
      </Tabs>
    </div>
  );
}