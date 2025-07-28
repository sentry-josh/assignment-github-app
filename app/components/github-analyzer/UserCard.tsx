import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { User, Users, Calendar, Crown } from "lucide-react";
import { formatJoinDate, UserDetails } from "../../lib";

interface UserCardProps {
  user: UserDetails;
  index: number;
}

const RANK_STYLES = {
  gradient: {
    0: "bg-gradient-to-br from-amber-400 to-orange-500",
    1: "bg-gradient-to-br from-gray-400 to-gray-600",
    2: "bg-gradient-to-br from-amber-600 to-yellow-700",
    default: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  badge: {
    0: "bg-amber-500 hover:bg-amber-600",
    1: "bg-gray-500 hover:bg-gray-600",
    2: "bg-amber-600 hover:bg-amber-700",
    default: "bg-blue-500 hover:bg-blue-600",
  },
} as const;

const getRankStyle = (index: number, type: keyof typeof RANK_STYLES) => {
  const styles = RANK_STYLES[type];
  return styles[index as keyof typeof styles] || styles.default;
};

export function UserCard({ user, index }: UserCardProps) {
  const rank = index + 1;

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white group">
      <CardContent className="p-0">
        <div className={`h-24 ${getRankStyle(index, "gradient")}`} />

        <div className="absolute top-4 right-4">
          <Badge
            className={`${getRankStyle(
              index,
              "badge",
            )} text-white border-0 font-bold`}
          >
            #{rank}
          </Badge>
        </div>

        {index === 0 && (
          <div className="absolute top-4 left-4">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
        )}

        <div className="relative px-6 -mt-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user.login} avatar`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-600" />
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-3">
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:text-blue-600 transition-colors"
          >
            <h4 className="font-semibold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600">
              @{user.login}
            </h4>
          </a>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                Since {formatJoinDate(user.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 flex-shrink-0" />
              <span>{user.followers.toLocaleString()} followers</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Followers Rank</span>
            <span className="text-xl font-bold text-gray-900">
              {user.followersRank.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
