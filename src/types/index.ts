/**
 * CRM type definitions
 * Centralize all shared types here
 */

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  contactId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIMetrics {
  totalDeals: number;
  totalValue: number;
  averageDealValue: number;
  dealsThisMonth: number;
  conversionRate?: number;
}

export interface TrendData {
  value: number;
  percentage: number;
  isPositive: boolean;
}
