import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          model: 'gpt-4.1-mini',

          messages: [
            {
              role: 'user',
              content: body.message,
            },
          ],
        }),
      }
    )

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Something went wrong',
      },
      {
        status: 500,
      }
    )
  }
}