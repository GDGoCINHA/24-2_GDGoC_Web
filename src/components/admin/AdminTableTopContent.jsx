"use client";

import React from 'react';
import { Input } from '@nextui-org/react';
import { IoSearch } from 'react-icons/io5';

export default function AdminTableTopContent({ searchValue, setSearchValue, onSearch }) {
  return (
    <Input
      isClearable
      classNames={{
        label: 'text-black/50 dark:text-white/90',
        input: [
          'bg-transparent',
          'text-black/90 dark:text-white/90',
          'placeholder:text-default-700/50 dark:placeholder:text-white/60',
        ],
        innerWrapper: 'bg-transparent',
        inputWrapper: [
          'shadow-xl',
          'bg-default-200/50',
          'dark:bg-default/60',
          'backdrop-blur-xl',
          'backdrop-saturate-200',
          'hover:bg-default-200/70',
          'dark:hover:bg-default/70',
          'group-data-[focus=true]:bg-default-200/50',
          'dark:group-data-[focus=true]:bg-default/60',
          '!cursor-text',
        ],
      }}
      placeholder="Type to search..."
      radius="lg"
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


