"use client";

import { Link } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

import type { HeartHandshakeIconHandle } from "@/components/animated-icons/heart-handshake";
import { HeartHandshakeIcon } from "@/components/animated-icons/heart-handshake";
import { BRAND_BUTTON } from "@/components/landing/button-styles";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const SponsorLink = () => {
  const heartRef = useRef<HeartHandshakeIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    heartRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    heartRef.current?.stopAnimation();
  }, []);

  return (
    <Button
      asChild
      size="sm"
      sound="click"
      className={cn("max-sm:size-8", BRAND_BUTTON)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={ROUTES.SPONSOR}>
        <HeartHandshakeIcon ref={heartRef} />
        <span className="max-sm:sr-only">Sponsor</span>
      </Link>
    </Button>
  );
};
