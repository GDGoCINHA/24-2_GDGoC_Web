import React from 'react';
import gdgocIcon from '@public/src/images/GDGoC_icon.png';
import Image from 'next/image';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { Heart, User } from "lucide-react";
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi.js';

export default function Header() {

  const { apiClient, handleLogout }= useAuthenticatedApi();

  return (
    <Navbar className=" pl-[32px] min-h-[105px]" maxWidth="full">
      <NavbarBrand className="flex flex-row gap-x-[16px] cursor-pointer flex-grow-0 basis-auto">
        <Image className='w-[62px] h-[28px]' src={gdgocIcon} alt='gdgocIcon' />
        <div className='text-white text-[16px] pt-[3px]'>
          <strong>GDGoC</strong> Inha univ.
        </div>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-16 ml-[70px]" justify="start">
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#">
            공지사항
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="/study">
            스터디
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#">
            프로젝트
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" className="text-white" href="#">
            멤버
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className='mr-5 gap-x-11'>
        <NavbarItem>
          <Heart className="w-9 h-9 text-white cursor-pointer" />
        </NavbarItem>
        <NavbarItem>
          <User className="w-9 h-9 text-white cursor-pointer" onClick={() => handleLogout()} />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
