'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-1 text-orange-500">{value}</p>
            {subtitle && (
              <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-zinc-600">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
