"use client";

import { Link } from "@tanstack/react-router";
import { CircleUser } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";

export const AccountButton = () => {
  const { account } = useAccount();
  const signedIn = Boolean(account?.signedIn);
  return (
    <Button asChild variant="ghost" size="sm" data-slot="account-button">
      <Link to={signedIn ? ROUTES.ACCOUNT : ROUTES.SIGN_IN}>
        <CircleUser aria-hidden />
        <span className="max-sm:sr-only">
          {signedIn ? "Account" : "Sign in"}
        </span>
      </Link>
    </Button>
  );
};
