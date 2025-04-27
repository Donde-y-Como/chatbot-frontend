import { QuickResponse } from './types';

// Mock data for quick responses
export const mockQuickResponses: QuickResponse[] = [
  {
    id: '1',
    shortcut: '/gracias',
    message: 'Muchas gracias por contactar con nosotros!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    shortcut: '/hola',
    message: 'Gracias por contactar con nosotros!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
