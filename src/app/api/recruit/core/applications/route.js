import axios from 'axios'

export async function POST(request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/core/applications`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader })
        }
      }
    )

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: 'Internal server error' }

    return new Response(JSON.stringify(data), {
      status: status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
