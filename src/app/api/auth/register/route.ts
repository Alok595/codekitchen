import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, roleHeadline } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roleHeadline: roleHeadline?.trim() || 'Active Candidate',
      createdAt: new Date().toISOString(),
      provider: 'credentials',
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        roleHeadline: newUser.roleHeadline,
      },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
