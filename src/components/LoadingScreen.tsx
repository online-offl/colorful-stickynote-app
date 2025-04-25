'use client';

import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="relative w-40 h-40">
        <img 
          src="/images/snail_loading.gif" 
          alt="Loading..." 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
} 