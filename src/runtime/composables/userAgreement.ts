import { useCookie } from "#app"

export const useUserPreferences = () => {
  const agreement = useCookie('telemetry-agreement', { default: () => true })
  return { agreement }
}