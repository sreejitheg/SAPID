import { Document, Message, Conversation, DynamicForm } from '../types';

export const demoConversations: Conversation[] = [
  {
    id: 'conv1',
    title: 'Equipment Purchase Request',
    createdAt: new Date('2024-01-20T10:00:00'),
    lastMessage: 'Perfect! I\'ve submitted your purchase request for the hydraulic pump...',
  },
  {
    id: 'conv2',
    title: 'Safety Incident Report',
    createdAt: new Date('2024-01-19T14:30:00'),
    lastMessage: 'Thank you for reporting this incident. I\'ve documented all the details...',
  },
  {
    id: 'conv3',
    title: 'Maintenance Manual Review',
    createdAt: new Date('2024-01-18T09:15:00'),
    lastMessage: 'The maintenance schedule shows several critical items...',
  },
];

export const demoDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Financial_Report_Q4_2024.pdf',
    type: 'permanent',
    size: 2450000,
    uploadedAt: new Date('2024-01-15'),
    url: '/demo/financial-report.pdf',
  },
  {
    id: 'doc2',
    name: 'Equipment_Maintenance_Manual.pdf',
    type: 'permanent',
    size: 5890000,
    uploadedAt: new Date('2024-01-10'),
    url: '/demo/maintenance-manual.pdf',
  },
  {
    id: 'doc3',
    name: 'Meeting_Notes_Jan_2024.docx',
    type: 'temporary',
    size: 124000,
    uploadedAt: new Date('2024-01-20'),
    conversationId: 'conv3',
  },
  {
    id: 'doc4',
    name: 'Incident_Photos.zip',
    type: 'temporary',
    size: 890000,
    uploadedAt: new Date('2024-01-19'),
    conversationId: 'conv2',
  },
];

export const demoMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: '1',
      type: 'user',
      content: 'I need to request a new hydraulic pump for our main production line. The current one is showing signs of wear.',
      timestamp: new Date('2024-01-20T10:00:00'),
    },
    {
      id: '2',
      type: 'assistant',
      content: 'I\'ll help you create a purchase request for the hydraulic pump. Let me gather the necessary information.\n\nFirst, could you tell me which department you\'re from?',
      timestamp: new Date('2024-01-20T10:00:30'),
    },
    {
      id: '3',
      type: 'user',
      content: 'I\'m from the Operations department.',
      timestamp: new Date('2024-01-20T10:01:00'),
    },
    {
      id: '4',
      type: 'assistant',
      content: 'Great! Now, what\'s the specific model or specifications for the hydraulic pump you need?',
      timestamp: new Date('2024-01-20T10:01:15'),
    },
    {
      id: '5',
      type: 'user',
      content: 'We need a Parker PV180R1K1T1NMMC hydraulic pump, 180cc displacement, 3000 PSI rated.',
      timestamp: new Date('2024-01-20T10:02:00'),
    },
    {
      id: '6',
      type: 'assistant',
      content: 'Perfect! How many units do you need, and what\'s your estimated budget for this purchase?',
      timestamp: new Date('2024-01-20T10:02:15'),
    },
    {
      id: '7',
      type: 'user',
      content: 'Just 1 unit. The estimated cost is around $3,200.',
      timestamp: new Date('2024-01-20T10:03:00'),
    },
    {
      id: '8',
      type: 'assistant',
      content: 'Excellent! Could you provide the business justification for this purchase?',
      timestamp: new Date('2024-01-20T10:03:15'),
    },
    {
      id: '9',
      type: 'user',
      content: 'The current pump is showing metal shavings in the hydraulic fluid and pressure drops during peak operation. This is critical for maintaining production uptime.',
      timestamp: new Date('2024-01-20T10:04:00'),
    },
    {
      id: '10',
      type: 'assistant',
      content: 'That sounds urgent. What\'s the urgency level and when do you need this delivered?',
      timestamp: new Date('2024-01-20T10:04:15'),
    },
    {
      id: '11',
      type: 'user',
      content: 'High urgency - we need it by February 1st to avoid production downtime.',
      timestamp: new Date('2024-01-20T10:05:00'),
    },
    {
      id: '12',
      type: 'assistant',
      content: 'Perfect! I\'ve gathered all the information. Here\'s your purchase request summary:\n\n**Purchase Request Summary:**\n• **Requestor:** Operations Department\n• **Item:** Parker PV180R1K1T1NMMC Hydraulic Pump\n• **Specifications:** 180cc displacement, 3000 PSI rated\n• **Quantity:** 1 unit\n• **Estimated Cost:** $3,200\n• **Justification:** Current pump showing wear with metal shavings and pressure drops affecting production\n• **Urgency:** High\n• **Required Delivery:** February 1st, 2024\n\nWould you like me to submit this purchase request?',
      timestamp: new Date('2024-01-20T10:05:30'),
      forms: [
        {
          id: 'purchase-confirmation',
          title: 'Confirm Purchase Request',
          description: 'Please review and confirm the purchase request details',
          submitLabel: 'Submit Purchase Request',
          data: {
            department: 'Operations',
            item_description: 'Parker PV180R1K1T1NMMC Hydraulic Pump - 180cc displacement, 3000 PSI rated',
            quantity: 1,
            estimated_cost: 3200,
            justification: 'Current pump showing wear with metal shavings and pressure drops affecting production',
            urgency: 'High',
            delivery_date: '2024-02-01'
          },
          fields: []
        }
      ],
    },
  ],
  conv2: [
    {
      id: '13',
      type: 'user',
      content: 'I need to report a safety incident that happened in the warehouse today.',
      timestamp: new Date('2024-01-19T14:30:00'),
    },
    {
      id: '14',
      type: 'assistant',
      content: 'I\'m sorry to hear about the incident. I\'ll help you file a proper safety incident report. Let\'s start with the basics.\n\nWhat type of incident occurred?',
      timestamp: new Date('2024-01-19T14:30:15'),
    },
    {
      id: '15',
      type: 'user',
      content: 'A forklift operator hit a storage rack while backing up. No one was injured, but some inventory fell.',
      timestamp: new Date('2024-01-19T14:31:00'),
    },
    {
      id: '16',
      type: 'assistant',
      content: 'Thank you for reporting this. When exactly did this incident occur, and where in the warehouse?',
      timestamp: new Date('2024-01-19T14:31:15'),
    },
    {
      id: '17',
      type: 'user',
      content: 'It happened around 2:15 PM today in Warehouse Section C, near the electronics storage area.',
      timestamp: new Date('2024-01-19T14:32:00'),
    },
    {
      id: '18',
      type: 'assistant',
      content: 'Got it. Can you describe what led to the incident and any immediate actions taken?',
      timestamp: new Date('2024-01-19T14:32:15'),
    },
    {
      id: '19',
      type: 'user',
      content: 'The operator was backing up to position for a pickup when the rear of the forklift struck the rack. We immediately secured the area, checked for injuries, and assessed the damage. About $500 worth of electronics fell but most were undamaged.',
      timestamp: new Date('2024-01-19T14:33:00'),
    },
    {
      id: '20',
      type: 'assistant',
      content: 'Thank you for the detailed information. I\'ve documented all the incident details:\n\n**Safety Incident Report Summary:**\n• **Type:** Equipment collision with storage rack\n• **Date/Time:** January 19, 2024 at 2:15 PM\n• **Location:** Warehouse Section C, electronics storage area\n• **Description:** Forklift struck storage rack while backing up\n• **Injuries:** None reported\n• **Damage:** Approximately $500 in fallen inventory\n• **Immediate Actions:** Area secured, safety check completed\n\nShall I submit this incident report to the safety department?',
      timestamp: new Date('2024-01-19T14:33:30'),
      forms: [
        {
          id: 'incident-confirmation',
          title: 'Confirm Safety Incident Report',
          description: 'Please review and confirm the incident report details',
          submitLabel: 'Submit Incident Report',
          data: {
            incident_type: 'Equipment collision',
            date_time: '2024-01-19T14:15:00',
            location: 'Warehouse Section C, electronics storage area',
            description: 'Forklift struck storage rack while backing up',
            injuries: 'None',
            damage_estimate: 500,
            immediate_actions: 'Area secured, safety check completed'
          },
          fields: []
        }
      ],
    },
  ],
  conv3: [
    {
      id: '21',
      type: 'user',
      content: 'Can you help me review the maintenance manual for our equipment?',
      timestamp: new Date('2024-01-18T09:15:00'),
    },
    {
      id: '22',
      type: 'assistant',
      content: 'I\'d be happy to help you review the maintenance manual. Let me analyze the document for you.\n\nBased on the Equipment Maintenance Manual, here are the key maintenance schedules and procedures:\n\n**Daily Inspections:**\n• Visual inspection for leaks, damage, or unusual wear\n• Check fluid levels (hydraulic, coolant, oil)\n• Verify safety systems are operational\n• Monitor temperature and pressure readings\n\n**Weekly Maintenance:**\n• Lubricate all grease points (12 locations marked)\n• Check and adjust belt tensions\n• Replace air and hydraulic filters\n• Calibrate pressure sensors\n\n**Monthly Service:**\n• Complete hydraulic system flush and refill\n• Inspect all electrical connections\n• Measure wear on critical components\n• Perform baseline performance tests\n\n**Critical Safety Reminders:**\n⚠️ Always use lockout/tagout procedures\n⚠️ Never bypass safety interlocks\n⚠️ Certified technician required for hydraulic work\n\nWould you like me to explain any specific maintenance procedure in detail?',
      timestamp: new Date('2024-01-18T09:15:45'),
      documents: [
        {
          id: 'doc2',
          name: 'Equipment_Maintenance_Manual.pdf',
          url: '/demo/maintenance-manual.pdf',
        },
      ],
    },
  ],
};

export const demoPurchaseForm: DynamicForm = {
  id: 'purchase-request-form',
  title: 'Equipment Purchase Request',
  description: 'Purchase request for hydraulic pump replacement',
  fields: [
    {
      name: 'requestor_name',
      type: 'text',
      label: 'Requestor Name',
      required: true,
      value: 'Operations Department',
    },
    {
      name: 'item_description',
      type: 'textarea',
      label: 'Item Description',
      required: true,
      value: 'Parker PV180R1K1T1NMMC Hydraulic Pump - 180cc displacement, 3000 PSI rated',
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      required: true,
      value: 1,
    },
    {
      name: 'estimated_cost',
      type: 'number',
      label: 'Estimated Cost (USD)',
      required: true,
      value: 3200,
    },
    {
      name: 'justification',
      type: 'textarea',
      label: 'Business Justification',
      required: true,
      value: 'Current pump showing wear with metal shavings and pressure drops affecting production',
    },
    {
      name: 'urgency',
      type: 'select',
      label: 'Urgency Level',
      required: true,
      options: ['Low', 'Medium', 'High', 'Critical'],
      value: 'High',
    },
    {
      name: 'delivery_date',
      type: 'date',
      label: 'Required Delivery Date',
      required: true,
      value: '2024-02-01',
    },
  ],
  submitLabel: 'Submit Purchase Request',
};