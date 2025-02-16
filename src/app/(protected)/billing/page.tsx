"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/stripe";
import { api } from "@/trpc/react";
import { InfoIcon } from "lucide-react";
import React, { useState } from "react";

const Billing = () => {
  const { data: user } = api.project.getMyCredits.useQuery();

  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);

  const creditsToBuyAmount = creditsToBuy[0]!;

  const price = (creditsToBuyAmount / 50).toFixed(2);

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>

      <p className="text-sm text-gray-500">
        You have <span className="text-purple-700">{user?.credits}</span>{" "}
        credits
      </p>

      <div className="h-2"></div>

      <div className="rounded-md border px-4 py-2">
        <div className="flex items-center gap-2">
          <InfoIcon className="size-4 text-purple-800" />

          <p className="text-sm text-purple-800">
            Each credit allows you to index 1 file in a repository.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          example:- If your project has 10 files. you will need{" "}
          <span className="text-purple-800">10</span> credits to index it.
        </p>
      </div>

      <div className="h-4"></div>

      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        value={creditsToBuy}
        onValueChange={(value) => setCreditsToBuy(value)}
      />

      <div className="h-4"></div>

      <Button
        onClick={() => {
          createCheckoutSession(creditsToBuyAmount);
        }}
      >
        Buy {creditsToBuyAmount} credit for ${price}
      </Button>
    </div>
  );
};

export default Billing;
