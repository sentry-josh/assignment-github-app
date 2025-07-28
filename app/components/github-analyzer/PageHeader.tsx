import React from "react";
import { Github } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export function PageHeader({
  title = "GitHub Network Analyzer",
  subtitle = "Discover influential users in GitHub follower networks through intelligent analysis",
}: PageHeaderProps) {
  return (
    <div className={`text-center mb-12`}>
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Github className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}
