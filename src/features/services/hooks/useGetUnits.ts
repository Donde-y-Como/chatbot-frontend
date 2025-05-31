import { useQuery } from '@tanstack/react-query'
import { getUnits } from '../../settings/units/unitsService'

export const useGetUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
    meta: {
      errorMessage: 'Error al cargar las unidades de medida',
    },
  })
}
