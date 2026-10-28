import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ icon: Icon, className = '', children, ...props }) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      )}
      <select {...props} className={`field appearance-none pr-9 ${Icon ? 'pl-9' : ''}`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    </div>
  );
}
