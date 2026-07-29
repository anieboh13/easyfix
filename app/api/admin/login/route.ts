import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const validUsername = username === process.env.ADMIN_USERNAME
  const validPassword = await bcrypt.compare(
    password || '',
    process.env.ADMIN_PASSWORD_HASH!
  )

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}