'use client'

import { Listbox, ListboxItem, ListboxSection } from '@nextui-org/react'

import { majorOptions } from '@/constant/majorOptions'

export default function MajorDropdownPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-10 bg-black py-10 text-white">
      <div className="gdg-dropdown-popover w-full max-w-xl">
        <Listbox
          aria-label="학과 목록"
          selectionMode="single"
          selectedKeys={['컴퓨터공학과']}
          classNames={{
            base: 'gdg-dropdown-popover',
            list: 'gdg-dropdown-list'
          }}
        >
          {majorOptions.map((group) => (
            <ListboxSection
              key={group.title}
              title={group.title}
              showDivider
              classNames={{
                base: 'gdg-dropdown-section',
                heading: 'gdg-dropdown-heading',
                group: 'gdg-dropdown-group',
                divider: 'gdg-dropdown-divider'
              }}
            >
              {group.items.map((item) => (
                <ListboxItem key={item.value} className="gdg-dropdown-item">
                  {item.value}
                </ListboxItem>
              ))}
            </ListboxSection>
          ))}
        </Listbox>
      </div>

      <div className="gdg-dropdown-popover w-full max-w-sm">
        <Listbox
          aria-label="학과 목록"
          selectionMode="single"
          selectedKeys={['컴퓨터공학과']}
          classNames={{
            base: 'gdg-dropdown-popover',
            list: 'gdg-dropdown-list'
          }}
        >
          {majorOptions.map((group) => (
            <ListboxSection
              key={group.title}
              title={group.title}
              showDivider
              classNames={{
                base: 'gdg-dropdown-section',
                heading: 'gdg-dropdown-heading',
                group: 'gdg-dropdown-group',
                divider: 'gdg-dropdown-divider'
              }}
            >
              {group.items.map((item) => (
                <ListboxItem key={item.value} className="gdg-dropdown-item">
                  {item.value}
                </ListboxItem>
              ))}
            </ListboxSection>
          ))}
        </Listbox>
      </div>
    </div>
  )
}
