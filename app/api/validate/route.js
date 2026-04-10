import { NextResponse } from 'next/server';
import { validateBridgeIntentLive } from '../../../lib/liveValidation';

export async function POST(request) {
  try {
    const form = await request.json();
    const result = await validateBridgeIntentLive(form);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error?.message || 'Validation failed.',
      },
      { status: 500 }
    );
  }
}
