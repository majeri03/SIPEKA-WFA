import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { success: false, data: 'Endpoint parameter required' },
      { status: 400 }
    );
  }

  try {
    // ✅ Build URL dengan SEMUA params
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('endpoint', endpoint);
    
    // ✅ Forward SEMUA params KECUALI endpoint
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        url.searchParams.append(key, value);
      }
    });

    console.log('📡 Proxy GET:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.ok ? 200 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('❌ Proxy GET error:', error);
    return NextResponse.json(
      { success: false, data: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { success: false, data: 'Endpoint parameter required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('endpoint', endpoint);

    console.log('📡 Proxy POST:', url.toString(), body);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.ok ? 200 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('❌ Proxy POST error:', error);
    return NextResponse.json(
      { success: false, data: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}