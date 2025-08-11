import { Transmit } from '@adonisjs/transmit-client'
import { usePage } from '@inertiajs/react'

export function useTransmit() {
  const { origin } = usePage().props

  return new Transmit({ baseUrl: origin as string })
}
// TODO: Is not unic instance no?
