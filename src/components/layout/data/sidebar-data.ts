import { IconChecklist, IconMessages, IconPackages, IconUsers } from '@tabler/icons-react'
import { BookUserIcon, CalendarFold, Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  teams: [
    {
      name: 'Vende más',
      logo: Command,
      plan: 'Plan',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        // {
        //   title: 'Dashboard',
        //   url: '/',
        //   icon: IconLayoutDashboard,
        // },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: IconMessages,
        },
        {
          title: 'Citas',
          url: '/citas',
          icon: IconChecklist,
        },
        {
          title: 'Eventos',
          url: '/eventos',
          icon: CalendarFold,
        },
        {
          title: 'Servicios',
          url: '/servicios',
          icon: IconPackages,
        },
        {
          title: 'Empleados',
          url: '/empleados',
          icon: IconUsers,
        },
        {
          title: 'Clientes',
          url: '/clientes',
          icon: BookUserIcon,
        },
      ],
    },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Settings',
    //       icon: IconSettings,
    //       items: [
    //         {
    //           title: 'Profile',
    //           url: '/settings',
    //           icon: IconUserCog,
    //         },
    //         {
    //           title: 'Account',
    //           url: '/settings/account',
    //           icon: IconTool,
    //         },
    //         {
    //           title: 'Appearance',
    //           url: '/settings/appearance',
    //           icon: IconPalette,
    //         },
    //         {
    //           title: 'Notifications',
    //           url: '/settings/notifications',
    //           icon: IconNotification,
    //         },
    //         {
    //           title: 'Display',
    //           url: '/settings/display',
    //           icon: IconBrowserCheck,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Help Center',
    //       url: '/help-center',
    //       icon: IconHelp,
    //     },
    //   ],
    // },
  ],
}
