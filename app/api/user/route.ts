import { NextResponse, NextRequest } from "next/server";
import { createUser } from "@/supabase/utils/user";
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, signingKey?: string) => void) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      console.error('Error fetching signing key:', err);
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function POST(req: NextRequest) {
  const { email }: { email: string } = await req.json();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({message: 'Missing authentication token'}, { status: 401 });
  }
  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await new Promise<jwt.JwtPayload | string>((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.AUTH0_CLIENT_ID,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as jwt.JwtPayload | string);
          }
        }
      );
    });

    if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
      const tokenEmail = (decoded as jwt.JwtPayload).email;

      if (tokenEmail !== email) {
        return NextResponse.json({ message: 'Unauthorized action attempted.' }, { status: 403 });
      }

      const { status } = await createUser(tokenEmail);
      return NextResponse.json({ status }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Email not found in token' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}