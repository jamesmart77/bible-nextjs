import { NextResponse, NextRequest } from "next/server";
import { createUser, getUserByEmail } from "@/supabase/utils/user";
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { saveSearchHistory } from "@/supabase/utils/searchHistory";

type RegisterUserType = {
  email: string;
  passageContext?: string;
};

type Auth0DecodedToken = {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  sid: string;
  nonce: string;
};

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

async function verifyToken(token: string): Promise<Auth0DecodedToken> {
  return new Promise((resolve, reject) => {
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
          resolve(decoded as Auth0DecodedToken);
        }
      }
    );
  })
};

function formatPassageContext(passagePath: string): string | null {
  const passageContext = passagePath.split('/passages')[1];
  const match = passageContext?.match(/^\/([^\/]+)\/(\d+)(?:\/(\d+)(?:-(\d+))?)?$/);
  if (match) {
    const [, book, chapter, startverse, endverse] = match;
    let formattedPassage = `${book} ${chapter}`;
    if (startverse) {
      formattedPassage += `:${startverse}`;
      if (endverse) {
        formattedPassage += `-${endverse}`;
      }
    }
    return formattedPassage;
  }
  return null;
}

async function savePassageSearch(email: string, userId?: number, passageContext?: string) {
  const formattedPassage = formatPassageContext(passageContext || '');
  if (!passageContext || passageContext === '/' || !formattedPassage) {
    return;
  }

  let userRecordId = userId;
  if (!userRecordId) {
    // this would only occur if the user was already registered so no userId was returned on createUser
    const user = await getUserByEmail(email);
    userRecordId = user?.id;
  }

  if (userRecordId && formattedPassage) {
    await saveSearchHistory(userRecordId, formattedPassage, 'passage');
  }
}

async function processUserRegistration(email: string, passageContext?: string) {
  let { status, user } = await createUser(email);

    if (status === 500) {
      throw new Error(`Error creating user: ${email}`);
    }

    if (!user) {
      user = await getUserByEmail(email);
    }
    
    return savePassageSearch(email, user?.id, passageContext);
}

export async function POST(req: NextRequest) {
  const { email, passageContext }: RegisterUserType = await req.json();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({message: 'Missing authentication token'}, { status: 401 });
  }
  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];
  let decodedToken: Auth0DecodedToken;

  try {
    decodedToken = await verifyToken(token);
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (!decodedToken.email) {
    return NextResponse.json({ message: 'Email not found in token' }, { status: 400 });
  }

  if (decodedToken.email !== email) {
    return NextResponse.json({ message: 'Unauthorized action attempted.' }, { status: 403 });
  }

  try {
    await processUserRegistration(email, passageContext);
    return NextResponse.json({ message: 'User registration successful' }, { status: 201 });
  } catch (error) {
    console.error('Error during user registration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during user registration';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}