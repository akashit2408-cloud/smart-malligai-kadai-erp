import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, storeName } = body;

    if (!email || !password || !fullName || !phone || !storeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = await createAdminClient();

    const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });

    if (signUpError || !authData.user) {
      return NextResponse.json(
        { error: signUpError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    const { data: store, error: storeError } = await admin
      .from('stores')
      .insert({ name: storeName, owner_id: userId })
      .select()
      .single();

    if (storeError || !store) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: storeError?.message || 'Failed to create store' },
        { status: 500 }
      );
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      phone,
      role: 'store_owner',
      store_id: store.id,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      await admin.from('stores').delete().eq('id', store.id);
      return NextResponse.json(
        { error: profileError.message || 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful',
      userId,
      storeId: store.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
