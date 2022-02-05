import { Typography } from "@supabase/ui";
import { SITE_INFO } from '../../lib/constants'

export default function Hero() {
  return (
    <div className="p-4">
      <Typography.Title level={3}>The Database Package Manager</Typography.Title>
      <p className="pt-4">
        <Typography.Text>{SITE_INFO.description}</Typography.Text>
      </p>
    </div>
  )
}
