"use client";

import React from 'react';
import { GdgInput } from '@/components/ui/input/GdgInput';
import { IoSearch } from 'react-icons/io5';

export default function AdminTableTopContent({ searchValue, setSearchValue, onSearch }) {
  return (
    <GdgInput
      isClearable
      placeholder="Type to search..."
      startContent={
        <IoSearch
          className="text-white cursor-pointer"
          onClick={onSearch}
        />
      }
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
          e.preventDefault();
          onSearch();
        }
      }}
      onClear={() => setSearchValue('')}
    />
  );
}


