import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the widget.js file from the public directory
    const widgetPath = path.join(process.cwd(), 'public', 'widget.js');
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8');

    // Return the widget content with proper JavaScript MIME type
    return new NextResponse(widgetContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error serving widget.js:', error);
    return new NextResponse('Error loading widget', { status: 500 });
  }
}
