"use client";

import { Switch } from "@/components/ui/switch";
import { useState, useTransition } from "react";
import { toggleIsAdmin } from "./actions";

export function IsAdminToggle({
  userId,
  defaultValue,
}: {
  userId: number;
  defaultValue: boolean;
}) {
  const [checked, setChecked] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  const handleChange = (value: boolean) => {
    setChecked(value);
    startTransition(async () => {
      const result = await toggleIsAdmin(userId, value);
      if (result.error) {
        setChecked(!value);
      }
    });
  };

  return (
    <Switch
      checked={checked}
      onCheckedChange={handleChange}
      disabled={pending}
    />
  );
}
