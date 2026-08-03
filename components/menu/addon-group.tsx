// components/menu/addon-group.tsx
import type { AddonGroup as AddonGroupType } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { Asterisk } from "lucide-react";

interface AddonGroupProps {
  group: AddonGroupType;
  selectedIds: string[];
  isUnsatisfied: boolean;
  onToggle: (addonId: string) => void;
}

export function AddonGroup({ group, selectedIds, isUnsatisfied, onToggle }: AddonGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center">
          {group.name}
          {group.isRequired && <Asterisk className="ml-1 h-4 w-4 text-red-500" />}
        </h3>
        <span className={`text-xs ${isUnsatisfied ? "text-red-500" : "text-neutral-400"}`}>
          {group.isRequired
            ? `Select ${group.minSelections}${group.maxSelections ? ` - ${group.maxSelections}` : "+"}`
            : "Optional"}
        </span>
      </div>

      <div className="space-y-2">
        {group.addons.map((addon) => {
          const isChecked = selectedIds.includes(addon.id);
          return (
            <label
              key={addon.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type={group.isMultiple ? "checkbox" : "radio"}
                  checked={isChecked}
                  onChange={() => onToggle(addon.id)}
                  name={group.id}
                  className="h-4 w-4 accent-orange-500"
                />
                <span className="text-sm text-neutral-700">{addon.name}</span>
              </div>
              {addon.price > 0 && (
                <span className="text-sm text-neutral-500">+{formatPrice(addon.price)}</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}