"use client";

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  company?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Clean common suffixes and punctuation to get base company domain
export function getCompanyDomain(companyName: string): string {
  if (!companyName) return '';
  const cleaned = companyName
    .toLowerCase()
    .trim()
    .replace(/^(the|a)\s+/i, '')
    .replace(/[\(\[].*?[\)\]]/g, '') // remove parentheticals like (Bengaluru)
    .replace(/[,;].*$/, '')
    .replace(/(\s+(inc|llc|ltd|corp|corporation|technologies|tech|solutions|protocols|labs|global|enterprise|systems|prime|digital|interactive|group))+$/i, '')
    .trim()
    .replace(/[^a-z0-9]/g, '');

  if (!cleaned) return '';
  return `${cleaned}.com`;
}

// Map well-known names to exact domains if needed
const DOMAIN_OVERRIDES: Record<string, string> = {
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'apple': 'apple.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'netflix': 'netflix.com',
  'stripe': 'stripe.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'airbnb': 'airbnb.com',
  'github': 'github.com',
  'openai': 'openai.com',
  'anthropic': 'anthropic.com',
  'nvidia': 'nvidia.com',
  'twitter': 'x.com',
  'x': 'x.com',
  'linkedin': 'linkedin.com',
  'slack': 'slack.com',
  'salesforce': 'salesforce.com',
  'webflow': 'webflow.com',
  'technova': 'technova.com',
  'datasync': 'datasync.com',
  'neuralai': 'neural.ai',
  'cloudscale': 'cloudscale.ch',
  'cortex': 'cortex.io',
  'fintech': 'fintech.com',
  'hyperchain': 'hyperchain.cn',
  'shieldnet': 'shieldnet.io',
  'nexus': 'nexus.com',
  'omnicloud': 'omnicloud.com',
  'aetheria': 'aetheria.io'
};

export function CompanyLogo({ company = '', className = '', size = 'md' }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);

  const cleanName = (company || '').trim();
  const lowerName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain = DOMAIN_OVERRIDES[lowerName] || getCompanyDomain(cleanName);

  // Logo providers to try sequentially
  const logoSources = domain ? [
    `https://unavatar.io/${domain}?fallback=false`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}`,
    `https://icon.horse/icon/${domain}`
  ] : [];

  useEffect(() => {
    setHasError(false);
    setSourceIndex(0);
  }, [company]);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base'
  }[size];

  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : '?';

  const handleError = () => {
    if (sourceIndex < logoSources.length - 1) {
      setSourceIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (!cleanName || !domain || hasError || logoSources.length === 0) {
    return (
      <div 
        className={`flex-shrink-0 bg-[#eee8dc] text-[#1a1a1a] border border-[#d8d0be] flex items-center justify-center font-bold font-serif shadow-xs ${sizeClasses} ${className}`}
        title={cleanName || 'Company'}
      >
        {cleanName ? initial : <Building2 className="w-3.5 h-3.5 text-[#8a8070]" />}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 bg-[#ffffff] border border-[#d8d0be] flex items-center justify-center overflow-hidden shadow-xs relative ${sizeClasses} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSources[sourceIndex]}
        alt={`${cleanName} logo`}
        className="w-full h-full object-contain p-0.5"
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
