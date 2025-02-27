import { createLazyFileRoute } from '@tanstack/react-router'
import Clients from '../../../features/clients'

export const Route = createLazyFileRoute('/_authenticated/clientes/')({
  component: Clients,
})
