import React from "react";
import { Button } from "../ui/button";
import { CheckCircle2, Search } from "lucide-react";

interface StickyHeaderProps {
  totalUsers: number;
  rootUser: string;
  depth: number;
  onSearch: () => void;
}

export function StickyHeader({
  totalUsers,
  rootUser,
  depth,
  onSearch,
}: StickyHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Analysis Complete</div>
            <div className="text-sm text-gray-600">
              {totalUsers} users found for <strong>@{rootUser}</strong> (depth{" "}
              {depth})
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onSearch}
          className="text-gray-700 hover:text-gray-900 border-gray-300"
        >
          <Search className="w-4 h-4 mr-2" />
          New Search
        </Button>
      </div>
    </div>
  );
}
