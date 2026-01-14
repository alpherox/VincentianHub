import { Research, User, QAQuestion, QAAnswer } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'dr.santos@vincentiansfile.edu',
    fullName: 'Dr. Maria Santos',
    role: 'researcher',
    bio: 'Associate Professor of Computer Science specializing in Machine Learning and Natural Language Processing.',
    affiliation: 'Vincentian University',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    email: 'prof.reyes@vincentiansfile.edu',
    fullName: 'Prof. Juan Reyes',
    role: 'researcher',
    bio: 'Research Fellow in Environmental Science with focus on sustainable development.',
    affiliation: 'Vincentian Research Institute',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    email: 'dr.cruz@vincentiansfile.edu',
    fullName: 'Dr. Ana Cruz',
    role: 'researcher',
    bio: 'Department Head of Social Sciences, expert in community development studies.',
    affiliation: 'Vincentian College of Arts',
    createdAt: new Date('2023-03-10'),
  },
  {
    id: 'admin1',
    email: 'admin@vincentiansfile.edu',
    fullName: 'System Administrator',
    role: 'admin',
    bio: 'VincentiansFile platform administrator.',
    affiliation: 'Vincentian University',
    createdAt: new Date('2023-01-01'),
  },
];

export const mockResearches: Research[] = [];

export const mockQAQuestions: QAQuestion[] = [
  {
    id: 'q1',
    researchId: '1',
    userId: 'student1',
    userName: 'John Student',
    content: 'What specific machine learning models were found to be most effective for medical imaging in your review?',
    upvotes: 5,
    createdAt: new Date('2024-11-20'),
    answers: [
      {
        id: 'a1',
        questionId: 'q1',
        userId: '1',
        userName: 'Dr. Maria Santos',
        content: 'Great question! Our review found that convolutional neural networks (CNNs), particularly ResNet and VGG architectures, showed the highest accuracy for radiology imaging. For pathology slides, Vision Transformers (ViT) are emerging as promising alternatives.',
        upvotes: 8,
        createdAt: new Date('2024-11-21'),
      }
    ],
  },
  {
    id: 'q2',
    researchId: '1',
    userId: 'student2',
    userName: 'Maria Garcia',
    content: 'How do you address the issue of data privacy when using patient data for ML training?',
    upvotes: 12,
    createdAt: new Date('2024-11-25'),
    answers: [],
  },
];
