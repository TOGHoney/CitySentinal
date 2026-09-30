"use client";

import { ChevronRight, LogOut, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ProfileHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const initials = (user?.name ?? "CU")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    void signOut();
    router.push("/login");
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 p-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "City User")}&background=0ea5e9&color=fff`} alt={user?.name ?? "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">@{user?.username}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Badge variant="secondary">{user?.department}</Badge>
            <Badge variant="outline" className="capitalize">{user?.role}</Badge>
            <Badge variant="outline">
              <MapPin className="mr-1 h-3 w-3" /> Header role: single authority user
            </Badge>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => router.push("/violations")}>
            E-Challan console <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}