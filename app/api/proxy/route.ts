import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';
  
  const url = `${APPS_SCRIPT_URL}?action=${endpoint}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';
  const body = await request.json();
  
  const url = `${APPS_SCRIPT_URL}?action=${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Failed to post data' }, { status: 500 });
  }
}