"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

export function useCurrentUser() {
  const { user, loading } = useAuth();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getOrCreateUser({
      workosUserId: user.id,
      email: user.email,
      displayName: user.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : user.email,
      avatarUrl: user.profilePictureUrl ?? undefined,
    }).then((id) => {
      if (!cancelled) setUserId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [user, getOrCreateUser]);

  return { userId, user, isLoading: loading || (!!user && userId === null) };
}
