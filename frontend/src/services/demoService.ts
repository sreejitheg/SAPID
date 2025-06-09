import { Document, Message } from '../types';

export const demoDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Project Proposal.pdf',
    type: 'permanent',
    size: 2450000,
    uploadedAt: new Date('2024-01-15'),
  },
  {
    id: 'doc2',
    name: 'Financial Report Q4.xlsx',
    type: 'permanent',
    size: 890000,
    uploadedAt: new Date('2024-01-10'),
  },
  {
    id: 'doc3',
    name: 'Meeting Notes.docx',
    type: 'temporary',
    size: 124000,
    uploadedAt: new Date('2024-01-20'),
  },
];

export const demoMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'Can you analyze the financial report and summarize the key findings?',
    timestamp: new Date('2024-01-20T10:00:00'),
  },
  {
    id: '2',
    type: 'assistant',
    content: 'Based on your Q4 Financial Report, here are the key findings:\n\n• Revenue increased by 15% compared to Q3\n• Operating expenses decreased by 8%\n• Net profit margin improved to 12.3%\n• Cash flow remains strong at $2.4M\n\nThe report shows positive growth trends across all major metrics.',
    timestamp: new Date('2024-01-20T10:00:30'),
    documents: [
      {
        id: 'doc2',
        name: 'Financial Report Q4.xlsx',
        url: '#',
      },
    ],
  },
];

export async function* demoStreamResponse(message: string): AsyncGenerator<string, void, unknown> {
  const responses = [
    "I'll help you with that. ",
    "Let me analyze the information provided. ",
    "Based on the documents you've shared, ",
    "here are my findings:\n\n",
    "• Key insight number one\n",
    "• Important observation two\n", 
    "• Critical finding three\n\n",
    "Would you like me to elaborate on any of these points?"
  ];

  for (const chunk of responses) {
    yield chunk;
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
  }
}