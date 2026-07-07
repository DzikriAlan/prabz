export interface MayarInvoiceItem {
  quantity: number
  rate: number
  description: string
}

export interface MayarCreateInvoiceParams {
  name: string
  email: string
  mobile: string
  description: string
  items: MayarInvoiceItem[]
  extraData?: Record<string, string>
}

export interface MayarInvoiceResult {
  id: string
  transactionId: string
  link: string
}

export function isMayarConfigured(): boolean {
  return !!process.env.MAYAR_API_KEY
}

function getMayarBaseUrl(): string {
  return process.env.MAYAR_BASE_URL ?? 'https://api.mayar.id/hl/v1'
}

function getMayarRedirectUrl(): string {
  return process.env.MAYAR_REDIRECT_URL ?? 'http://localhost:3000/commerce'
}

// Docs: https://docs.mayar.id/api-reference/invoice/create
export async function createMayarInvoice(params: MayarCreateInvoiceParams): Promise<MayarInvoiceResult> {
  const apiKey = process.env.MAYAR_API_KEY
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const res = await fetch(`${getMayarBaseUrl()}/invoice/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      mobile: params.mobile,
      redirectUrl: getMayarRedirectUrl(),
      description: params.description,
      expiredAt,
      items: params.items,
      extraData: params.extraData ?? {},
    }),
  })

  const json = (await res.json()) as { statusCode: number; messages: string; data?: MayarInvoiceResult }
  if (!res.ok || !json.data) {
    // eslint-disable-next-line no-console
    console.error(`Mayar invoice creation failed: ${json.messages ?? res.statusText}`)
    throw new Error('Failed to create Mayar invoice')
  }
  return json.data
}
