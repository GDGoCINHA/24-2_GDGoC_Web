"use client";

import React, { useState } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@nextui-org/react";
import { Heart, User, LogOut } from "lucide-react";
import Image from 'next/image';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi.js';

import gdgocIcon from '@public/icons/logo.png';

export default function MenuHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { apiClient, handleLogout }= useAuthenticatedApi();

  const menuItems = [
    { name: "멤버관리", href: "/admin" },
    { name: "스터디", href: "#", onClick: () => alert('준비중입니다.') },
    { name: "공지사항", href: "#", onClick: () => alert('준비중입니다.') },
    { name: "프로젝트", href: "#", onClick: () => alert('준비중입니다.') },
    { name: "로그아웃", href: "#", onClick: handleLogout }
  ];

  return (
    <Navbar 
      //className=" min-h-[105px]" 
      height="6rem"
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="hidden mobile:inline text-white "
        />
        <NavbarBrand className="flex flex-row gap-x-[16px] cursor-pointer flex-grow-0 basis-auto">
          <Image className='w-[62px] h-[28px]' src={gdgocIcon} alt='gdgocIcon' />
          <div className='text-white text-[16px] pt-[3px]'>
            <strong>GDGoC</strong> Inha univ.
          </div>
        </NavbarBrand>
      </NavbarContent>
      
      <NavbarContent className="mobile:hidden flex gap-16 ml-[70px]" justify="start">
        <NavbarItem>
          <Link color="foreground" className="text-white" href="/admin" >
            멤버관리
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#" onPress={() => alert('준비중입니다.')}>
            스터디
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#" onPress={() => alert('준비중입니다.')}>
            공지사항
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#" onPress={() => alert('준비중입니다.')}>
            프로젝트
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className='mr-5 gap-x-11'>
        <NavbarItem>
          <LogOut className="w-9 h-9 text-white cursor-pointer mobile:hidden" onClick={() => handleLogout()} />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className='pt-5'>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className={`w-full text-white ${index === 4 ? "text-red-500 font-bold" : ""}`}
              href={item.href}
              size="lg"
              onPress={item.onClick}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
