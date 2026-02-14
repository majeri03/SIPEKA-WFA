import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      params.append(key, value);
    }
  });

  const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

  // 🔥 Check jika Apps Script URL belum dikonfigurasi
  if (!appsScriptUrl || appsScriptUrl === '') {
    console.warn('⚠️ Apps Script URL tidak ada, gunakan mock data di frontend');
    return NextResponse.json(
      { 
        error: 'Apps Script URL belum dikonfigurasi',
        useMockData: true
      },
      { status: 503 }
    );
  }

  const url = `${appsScriptUrl}?action=${endpoint}&${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    
    // 🔥 Check jika response bukan JSON (biasanya HTML error page)
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response bukan JSON:', text.substring(0, 200));
      
      return NextResponse.json(
        { 
          error: 'Invalid Apps Script URL atau script belum di-deploy',
          useMockData: true
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err) {
    console.error('❌ API Error:', err);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Apps Script',
        useMockData: true,
        message: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}