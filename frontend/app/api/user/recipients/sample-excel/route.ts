import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create sample data with example custom fields
    const sampleData = [
      { Name: 'John Doe', Email: 'john.doe@example.com', Phone: '+1234567890', Company: 'Acme Corp' },
      { Name: 'Jane Smith', Email: 'jane.smith@example.com', Phone: '+0987654321', Company: 'Tech Inc' },
      { Name: 'Bob Johnson', Email: 'bob.johnson@example.com', Phone: '+1122334455', Company: 'StartupXYZ' },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Name column
      { wch: 30 }, // Email column
      { wch: 15 }, // Phone column
      { wch: 20 }, // Company column
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file as response
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="sample-recipients.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Error generating sample Excel:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

