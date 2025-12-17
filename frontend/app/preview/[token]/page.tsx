import { Metadata } from 'next';
import PreviewPageClient from './PreviewPageClient';
import connectDB from '@/lib/db';
import SharedTemplate from '@/lib/models/SharedTemplate';

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  return {
    title: 'Email Template Preview - PRZIO',
    description: 'Preview email template',
  };
}

async function getSharedTemplate(token: string) {
  try {
    await connectDB();

    const sharedTemplate = await SharedTemplate.findOne({
      shareToken: token,
    }).lean();

    if (!sharedTemplate) {
      return null;
    }

    // Check if expired
    if (sharedTemplate.expiresAt && new Date(sharedTemplate.expiresAt) < new Date()) {
      return null;
    }

    return {
      html: sharedTemplate.html,
      createdAt: sharedTemplate.createdAt,
    };
  } catch (error) {
    console.error('Error fetching shared template:', error);
    return null;
  }
}

export default async function PreviewPage({ params }: { params: { token: string } }) {
  const templateData = await getSharedTemplate(params.token);

  if (!templateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600">This shared template may have expired or been deleted.</p>
        </div>
      </div>
    );
  }

  return <PreviewPageClient html={templateData.html} shareToken={params.token} />;
}

